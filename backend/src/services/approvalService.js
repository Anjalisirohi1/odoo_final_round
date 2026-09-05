const { pool } = require("../config/db");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

async function getUserRole(client, userId) {
    const { rows } = await client.query(
        `
        SELECT r.name AS role_name
        FROM users u
        JOIN roles r
            ON r.id = u.role_id
        WHERE u.id = $1
          AND u.is_active = TRUE
        `,
        [userId]
    );

    return rows[0]?.role_name || null;
}

async function getNextApprover(client, roleName) {
    const { rows } = await client.query(
        `
        SELECT
            u.id,
            u.name,
            u.email
        FROM users u
        JOIN roles r
            ON r.id = u.role_id
        WHERE r.name = $1
          AND u.is_active = TRUE
        ORDER BY u.created_at ASC
        LIMIT 1
        `,
        [roleName]
    );

    return rows[0] || null;
}


/*
|--------------------------------------------------------------------------
| 3. Pending Approval Queue
|--------------------------------------------------------------------------
*/

async function getPendingApprovals(userId) {
    const client = await pool.connect();

    try {
        const role = await getUserRole(client, userId);

        if (
            role !== "SALES_MANAGER" &&
            role !== "FINANCE"
        ) {
            const error = new Error(
                "Only Sales Managers and Finance users can view approval queues."
            );

            error.statusCode = 403;

            throw error;
        }

        const { rows } = await client.query(
            `
            SELECT
                ar.id,
                ar.quotation_id,
                ar.requested_by,
                ar.assigned_to,
                ar.approval_level,
                ar.status,
                ar.reason,
                ar.requested_at,

                q.quotation_number,
                q.status AS quotation_status,
                q.subtotal,
                q.discount_amount,
                q.tax_amount,
                q.total_amount,
                q.valid_until,

                c.company_name AS customer_name,
                c.contact_name AS customer_contact,

                ct.name AS customer_tier,

                requester.name AS requested_by_name,
                assignee.name AS assigned_to_name

            FROM approval_requests ar

            JOIN quotations q
                ON q.id = ar.quotation_id

            JOIN customers c
                ON c.id = q.customer_id

            JOIN customer_tiers ct
                ON ct.id = c.tier_id

            JOIN users requester
                ON requester.id = ar.requested_by

            LEFT JOIN users assignee
                ON assignee.id = ar.assigned_to

            WHERE ar.status = 'PENDING'
              AND ar.assigned_to = $1

            ORDER BY ar.requested_at ASC
            `,
            [userId]
        );

        return rows;

    } finally {
        client.release();
    }
}


/*
|--------------------------------------------------------------------------
| 4. Approval Details
|--------------------------------------------------------------------------
*/

async function getApprovalDetails(
    approvalRequestId,
    userId
) {
    const client = await pool.connect();

    try {
        const role = await getUserRole(client, userId);

        if (
            role !== "SALES_MANAGER" &&
            role !== "FINANCE"
        ) {
            const error = new Error(
                "You are not authorized to view approval details."
            );

            error.statusCode = 403;

            throw error;
        }

        /*
        |--------------------------------------------------------------------------
        | Approval request
        |--------------------------------------------------------------------------
        */

        const approvalResult = await client.query(
            `
            SELECT
                ar.*,

                requester.name AS requested_by_name,
                requester.email AS requested_by_email,

                assignee.name AS assigned_to_name,
                assignee.email AS assigned_to_email

            FROM approval_requests ar

            JOIN users requester
                ON requester.id = ar.requested_by

            LEFT JOIN users assignee
                ON assignee.id = ar.assigned_to

            WHERE ar.id = $1
            `,
            [approvalRequestId]
        );

        if (!approvalResult.rows.length) {
            const error = new Error(
                "Approval request not found."
            );

            error.statusCode = 404;

            throw error;
        }

        const approval = approvalResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | Security check
        |--------------------------------------------------------------------------
        */

        if (
            approval.assigned_to &&
            approval.assigned_to !== userId
        ) {
            const error = new Error(
                "This approval request is not assigned to you."
            );

            error.statusCode = 403;

            throw error;
        }

        /*
        |--------------------------------------------------------------------------
        | Quotation
        |--------------------------------------------------------------------------
        */

        const quotationResult = await client.query(
            `
            SELECT
                q.*,

                c.company_name AS customer_name,
                c.contact_name AS customer_contact,
                c.email AS customer_email,
                c.phone AS customer_phone,

                ct.name AS customer_tier,
                ct.default_discount_limit,

                u.name AS sales_rep_name,
                u.email AS sales_rep_email,

                pl.name AS price_list_name

            FROM quotations q

            JOIN customers c
                ON c.id = q.customer_id

            JOIN customer_tiers ct
                ON ct.id = c.tier_id

            JOIN users u
                ON u.id = q.sales_rep_id

            JOIN price_lists pl
                ON pl.id = q.price_list_id

            WHERE q.id = $1
            `,
            [approval.quotation_id]
        );

        if (!quotationResult.rows.length) {
            const error = new Error(
                "Quotation associated with approval was not found."
            );

            error.statusCode = 404;

            throw error;
        }

        const quotation = quotationResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | Quotation items + applicable discount rules
        |--------------------------------------------------------------------------
        */

        const itemsResult = await client.query(
            `
            SELECT
                qi.id,
                qi.product_id,
                qi.variant_id,
                qi.quantity,
                qi.unit_price,
                qi.discount_percent,
                qi.discount_amount,
                qi.tax_rate,
                qi.line_total,

                p.name AS product_name,
                p.description AS product_description,

                cat.id AS category_id,
                cat.name AS category_name,

                dr.max_discount,
                dr.approval_level AS rule_approval_level,

                CASE
                    WHEN qi.discount_percent > dr.max_discount
                    THEN TRUE
                    ELSE FALSE
                END AS exceeds_limit,

                CASE
                    WHEN qi.discount_percent > dr.max_discount
                    THEN ROUND(
                        (qi.discount_percent - dr.max_discount)::numeric,
                        2
                    )
                    ELSE 0
                END AS excess_discount

            FROM quotation_items qi

            JOIN products p
                ON p.id = qi.product_id

            JOIN categories cat
                ON cat.id = p.category_id

            LEFT JOIN discount_rules dr
                ON dr.tier_id = $2
               AND dr.category_id = cat.id

            WHERE qi.quotation_id = $1

            ORDER BY qi.created_at
            `,
            [
                approval.quotation_id,
                quotation.customer_tier_id
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Approval history
        |--------------------------------------------------------------------------
        */

        const historyResult = await client.query(
            `
            SELECT
                ah.id,
                ah.action,
                ah.reason,
                ah.action_at,

                u.id AS action_by_id,
                u.name AS action_by_name,
                r.name AS action_by_role

            FROM approval_history ah

            JOIN users u
                ON u.id = ah.action_by

            JOIN roles r
                ON r.id = u.role_id

            WHERE ah.approval_request_id = $1

            ORDER BY ah.action_at ASC
            `,
            [approvalRequestId]
        );

        /*
        |--------------------------------------------------------------------------
        | Calculate violations
        |--------------------------------------------------------------------------
        */

        const violations = itemsResult.rows.filter(
            item => item.exceeds_limit
        );

        return {
            approval,
            quotation,
            items: itemsResult.rows,
            violations,
            history: historyResult.rows
        };

    } finally {
        client.release();
    }
}


/*
|--------------------------------------------------------------------------
| 5 + 6. Take Approval Action
|--------------------------------------------------------------------------
*/

async function takeApprovalAction(
    approvalRequestId,
    userId,
    action,
    reason
) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /*
        |--------------------------------------------------------------------------
        | Validate action
        |--------------------------------------------------------------------------
        */

        const validActions = [
            "APPROVED",
            "REJECTED",
            "RETURNED"
        ];

        if (!validActions.includes(action)) {
            const error = new Error(
                "Invalid approval action."
            );

            error.statusCode = 400;

            throw error;
        }

        /*
        |--------------------------------------------------------------------------
        | Get current user role
        |--------------------------------------------------------------------------
        */

        const role = await getUserRole(
            client,
            userId
        );

        if (
            role !== "SALES_MANAGER" &&
            role !== "FINANCE"
        ) {
            const error = new Error(
                "You are not authorized to perform approval actions."
            );

            error.statusCode = 403;

            throw error;
        }

        /*
        |--------------------------------------------------------------------------
        | Get approval request
        |--------------------------------------------------------------------------
        */

        const approvalResult = await client.query(
            `
            SELECT
                ar.*,
                q.status AS quotation_status
            FROM approval_requests ar
            JOIN quotations q
                ON q.id = ar.quotation_id
            WHERE ar.id = $1
            FOR UPDATE
            `,
            [approvalRequestId]
        );

        if (!approvalResult.rows.length) {
            const error = new Error(
                "Approval request not found."
            );

            error.statusCode = 404;

            throw error;
        }

        const approval = approvalResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | Only assigned user can act
        |--------------------------------------------------------------------------
        */

        if (
            approval.assigned_to &&
            approval.assigned_to !== userId
        ) {
            const error = new Error(
                "This approval request is not assigned to you."
            );

            error.statusCode = 403;

            throw error;
        }

        /*
        |--------------------------------------------------------------------------
        | Must still be pending
        |--------------------------------------------------------------------------
        */

        if (approval.status !== "PENDING") {
            const error = new Error(
                "This approval request has already been resolved."
            );

            error.statusCode = 400;

            throw error;
        }

        /*
        |--------------------------------------------------------------------------
        | Role validation for current stage
        |--------------------------------------------------------------------------
        */

        if (
            role === "SALES_MANAGER" &&
            approval.approval_level === "FINANCE"
        ) {
            const error = new Error(
                "This approval is currently waiting for Finance."
            );

            error.statusCode = 403;

            throw error;
        }

        if (
            role === "FINANCE" &&
            approval.approval_level === "MANAGER"
        ) {
            const error = new Error(
                "This approval is currently waiting for the Sales Manager."
            );

            error.statusCode = 403;

            throw error;
        }

        /*
        |--------------------------------------------------------------------------
        | Resolve current approval request
        |--------------------------------------------------------------------------
        */

        await client.query(
            `
            UPDATE approval_requests
            SET
                status = $1,
                resolved_at = CURRENT_TIMESTAMP
            WHERE id = $2
            `,
            [
                action,
                approvalRequestId
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Record approval history
        |--------------------------------------------------------------------------
        */

        await client.query(
            `
            INSERT INTO approval_history (
                approval_request_id,
                action_by,
                action,
                reason
            )
            VALUES ($1, $2, $3, $4)
            `,
            [
                approvalRequestId,
                userId,
                action,
                reason || null
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | REJECTED
        |--------------------------------------------------------------------------
        */

        if (action === "REJECTED") {

            await client.query(
                `
                UPDATE quotations
                SET
                    status = 'REJECTED',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                [approval.quotation_id]
            );

            await client.query(
                `
                INSERT INTO audit_logs (
                    user_id,
                    entity_type,
                    entity_id,
                    action,
                    old_value,
                    new_value,
                    reason
                )
                VALUES (
                    $1,
                    'QUOTATION',
                    $2,
                    'APPROVAL_REJECTED',
                    $3,
                    $4,
                    $5
                )
                `,
                [
                    userId,
                    approval.quotation_id,
                    JSON.stringify({
                        status: approval.quotation_status
                    }),
                    JSON.stringify({
                        status: "REJECTED"
                    }),
                    reason || null
                ]
            );

            await client.query("COMMIT");

            return {
                status: "REJECTED",
                nextStage: null
            };
        }

        /*
        |--------------------------------------------------------------------------
        | RETURNED
        |--------------------------------------------------------------------------
        */

        if (action === "RETURNED") {

            await client.query(
                `
                UPDATE quotations
                SET
                    status = 'DRAFT',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                [approval.quotation_id]
            );

            await client.query(
                `
                INSERT INTO audit_logs (
                    user_id,
                    entity_type,
                    entity_id,
                    action,
                    old_value,
                    new_value,
                    reason
                )
                VALUES (
                    $1,
                    'QUOTATION',
                    $2,
                    'APPROVAL_RETURNED',
                    $3,
                    $4,
                    $5
                )
                `,
                [
                    userId,
                    approval.quotation_id,
                    JSON.stringify({
                        status: approval.quotation_status
                    }),
                    JSON.stringify({
                        status: "DRAFT"
                    }),
                    reason || null
                ]
            );

            await client.query("COMMIT");

            return {
                status: "RETURNED",
                nextStage: "SALES_REP"
            };
        }

        /*
        |--------------------------------------------------------------------------
        | APPROVED
        |--------------------------------------------------------------------------
        */

        /*
        | MANAGER_AND_FINANCE:
        | Manager approval is NOT final.
        */

        if (
            approval.approval_level ===
                "MANAGER_AND_FINANCE" &&
            role === "SALES_MANAGER"
        ) {

            const finance =
                await getNextApprover(
                    client,
                    "FINANCE"
                );

            if (!finance) {
                const error = new Error(
                    "No active Finance approver is configured."
                );

                error.statusCode = 500;

                throw error;
            }

            /*
            | Create next-stage Finance approval
            */

            const financeRequest =
                await client.query(
                    `
                    INSERT INTO approval_requests (
                        quotation_id,
                        requested_by,
                        assigned_to,
                        approval_level,
                        status,
                        reason
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        'FINANCE',
                        'PENDING',
                        $4
                    )
                    RETURNING id
                    `,
                    [
                        approval.quotation_id,
                        userId,
                        finance.id,
                        "Manager approved. Finance approval required."
                    ]
                );

            /*
            | Keep quotation pending
            */

            await client.query(
                `
                UPDATE quotations
                SET
                    status = 'PENDING_APPROVAL',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                [approval.quotation_id]
            );

            /*
            | Audit handoff
            */

            await client.query(
                `
                INSERT INTO audit_logs (
                    user_id,
                    entity_type,
                    entity_id,
                    action,
                    old_value,
                    new_value,
                    reason
                )
                VALUES (
                    $1,
                    'QUOTATION',
                    $2,
                    'MANAGER_APPROVED_FINANCE_REQUIRED',
                    $3,
                    $4,
                    $5
                )
                `,
                [
                    userId,
                    approval.quotation_id,
                    JSON.stringify({
                        status: approval.quotation_status
                    }),
                    JSON.stringify({
                        status: "PENDING_APPROVAL",
                        next_stage: "FINANCE"
                    }),
                    reason || null
                ]
            );

            await client.query("COMMIT");

            return {
                status: "PENDING_APPROVAL",
                nextStage: "FINANCE",
                nextApprover: {
                    id: finance.id,
                    name: finance.name,
                    email: finance.email
                },
                financeApprovalRequestId:
                    financeRequest.rows[0].id
            };
        }

        /*
        |--------------------------------------------------------------------------
        | MANAGER-only or Finance final approval
        |--------------------------------------------------------------------------
        */

        await client.query(
            `
            UPDATE quotations
            SET
                status = 'APPROVED',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            `,
            [approval.quotation_id]
        );

        await client.query(
            `
            INSERT INTO audit_logs (
                user_id,
                entity_type,
                entity_id,
                action,
                old_value,
                new_value,
                reason
            )
            VALUES (
                $1,
                'QUOTATION',
                $2,
                'APPROVAL_COMPLETED',
                $3,
                $4,
                $5
            )
            `,
            [
                userId,
                approval.quotation_id,
                JSON.stringify({
                    status: approval.quotation_status
                }),
                JSON.stringify({
                    status: "APPROVED"
                }),
                reason || null
            ]
        );

        await client.query("COMMIT");

        return {
            status: "APPROVED",
            nextStage: null
        };

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {
        client.release();
    }
}


// I'm adding createApprovalRequest back here because quotationService.js might depend on it.
const createApprovalRequest = async (quotationId, requestedBy, assignedTo, approvalLevel, reason, client = pool) => {
  if (!assignedTo) {
      let targetRole = approvalLevel;
      if (targetRole === 'MANAGER' || targetRole === 'MANAGER_AND_FINANCE') {
          targetRole = 'SALES_MANAGER';
      }
      const approver = await getNextApprover(client, targetRole);
      if (approver) {
          assignedTo = approver.id;
      }
  }

  const result = await client.query(`
    INSERT INTO approval_requests (
      quotation_id,
      requested_by,
      assigned_to,
      approval_level,
      status,
      reason
    ) VALUES ($1, $2, $3, $4, 'PENDING', $5)
    RETURNING *
  `, [quotationId, requestedBy, assignedTo, approvalLevel, reason]);
  return result.rows[0];
};

module.exports = {
    getPendingApprovals,
    getApprovalDetails,
    takeApprovalAction,
    createApprovalRequest
};
