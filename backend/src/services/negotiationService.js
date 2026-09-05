const { pool } = require("../config/db");

const model = require("../models/negotiationModel");
const quotationService = require("./quotationService");


/*
|--------------------------------------------------------------------------
| Resolve customer from logged-in user
|--------------------------------------------------------------------------
|
| Resolves customer ID from:
| 1. req.user.customer_id
| 2. req.user.email -> customers.email
| 3. req.user.id -> users.email -> customers.email
|
|--------------------------------------------------------------------------
*/

async function resolveCustomerId(user) {
    if (!user) return null;

    if (user.customer_id) {
        return user.customer_id;
    }

    let email = user.email;
    if (!email && user.id) {
        const userRes = await pool.query(
            `SELECT email FROM users WHERE id = $1`,
            [user.id]
        );
        email = userRes.rows[0]?.email;
    }

    if (!email) return null;

    const { rows } = await pool.query(
        `
        SELECT id
        FROM customers
        WHERE email = $1
          AND (is_active = TRUE OR is_active IS NULL)
        LIMIT 1
        `,
        [email]
    );

    return rows[0]?.id || null;
}


/*
|--------------------------------------------------------------------------
| CUSTOMER: Submit negotiation
|--------------------------------------------------------------------------
*/

async function createNegotiation(
    user,
    quotationId,
    message,
    requestedDeliveryDate,
    items
) {

    const customerId = await resolveCustomerId(user);

    if (!customerId) {
        const error = new Error(
            "Customer account is not linked to a customer record."
        );
        error.statusCode = 400;
        throw error;
    }

    const quotation = await model.getQuotationForCustomer(
        quotationId,
        customerId
    );

    if (!quotation) {
        const error = new Error("Quotation not found.");
        error.statusCode = 404;
        throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | Only customer-facing quotations can be negotiated
    |--------------------------------------------------------------------------
    */

    if (!["SENT", "NEGOTIATING", "DRAFT"].includes(quotation.status)) {
        const error = new Error(
            `Quotation cannot be negotiated while it is ${quotation.status}.`
        );
        error.statusCode = 400;
        throw error;
    }


    const client = await pool.connect();

    try {
        await client.query("BEGIN");


        /*
        |--------------------------------------------------------------------------
        | Prevent duplicate active negotiation
        |--------------------------------------------------------------------------
        */

        const existing = await client.query(
            `
            SELECT id
            FROM negotiation_requests
            WHERE quotation_id = $1
              AND status = 'PENDING'
            LIMIT 1
            `,
            [quotationId]
        );

        if (existing.rows.length) {
            const error = new Error(
                "A negotiation request is already pending for this quotation."
            );
            error.statusCode = 400;
            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | Create request
        |--------------------------------------------------------------------------
        */

        const negotiation = await model.createNegotiation(
            client,
            {
                quotationId,
                customerId,
                requestedBy: user.id,
                message,
                requestedDeliveryDate
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Verify quotation items
        |--------------------------------------------------------------------------
        */

        const quotationItems = await model.getQuotationItems(quotationId);
        const validItemIds = new Set(quotationItems.map(item => item.id));


        /*
        |--------------------------------------------------------------------------
        | Store requested changes
        |--------------------------------------------------------------------------
        */

        for (const item of items || []) {
            if (!validItemIds.has(item.quotationItemId)) {
                const error = new Error(
                    `Invalid quotation item: ${item.quotationItemId}`
                );
                error.statusCode = 400;
                throw error;
            }

            await model.createNegotiationItem(
                client,
                {
                    negotiationId: negotiation.id,
                    quotationItemId: item.quotationItemId,
                    requestedQuantity: item.requestedQuantity,
                    requestedUnitPrice: item.requestedUnitPrice,
                    requestedDiscountPercent: item.requestedDiscountPercent,
                    customerNote: item.customerNote
                }
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Mark quotation as negotiating
        |--------------------------------------------------------------------------
        */

        await client.query(
            `
            UPDATE quotations
            SET
                status = 'NEGOTIATING',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            `,
            [quotationId]
        );


        /*
        |--------------------------------------------------------------------------
        | History
        |--------------------------------------------------------------------------
        */

        await model.addHistory(
            client,
            {
                negotiationId: negotiation.id,
                actionBy: user.id,
                action: "SUBMITTED",
                message: message || "Customer submitted a negotiation request."
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Audit
        |--------------------------------------------------------------------------
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
                'NEGOTIATION_STARTED',
                $3,
                $4,
                $5
            )
            `,
            [
                user.id,
                quotationId,
                JSON.stringify({ status: quotation.status }),
                JSON.stringify({ status: "NEGOTIATING" }),
                message || null
            ]
        );


        await client.query("COMMIT");

        return model.getNegotiationDetails(negotiation.id);

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}


/*
|--------------------------------------------------------------------------
| CUSTOMER: My negotiations
|--------------------------------------------------------------------------
*/

async function getMyNegotiations(user) {
    const customerId = await resolveCustomerId(user);

    if (!customerId) {
        const error = new Error("Customer account is not linked.");
        error.statusCode = 400;
        throw error;
    }

    return model.getCustomerNegotiations(customerId);
}


/*
|--------------------------------------------------------------------------
| NEGOTIATION DETAILS
|--------------------------------------------------------------------------
*/

async function getDetails(negotiationId, user) {
    const data = await model.getNegotiationDetails(negotiationId);

    if (!data) {
        const error = new Error("Negotiation not found.");
        error.statusCode = 404;
        throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | Customer ownership
    |--------------------------------------------------------------------------
    */

    if (user.role === "CUSTOMER") {
        const customerId = await resolveCustomerId(user);

        if (data.negotiation.customer_id !== customerId) {
            const error = new Error(
                "You are not authorized to view this negotiation."
            );
            error.statusCode = 403;
            throw error;
        }
    }

    return data;
}


/*
|--------------------------------------------------------------------------
| SALES: pending negotiations
|--------------------------------------------------------------------------
*/

async function getPendingNegotiations() {
    return model.getPendingNegotiations();
}


/*
|--------------------------------------------------------------------------
| SALES: respond
|--------------------------------------------------------------------------
*/

async function respond(negotiationId, userId, action, message) {
    const validActions = ["ACCEPTED", "REJECTED", "COUNTERED"];

    if (!validActions.includes(action)) {
        const error = new Error("Invalid negotiation action.");
        error.statusCode = 400;
        throw error;
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");


        /*
        |--------------------------------------------------------------------------
        | Lock negotiation
        |--------------------------------------------------------------------------
        */

        const result = await client.query(
            `
            SELECT *
            FROM negotiation_requests
            WHERE id = $1
            FOR UPDATE
            `,
            [negotiationId]
        );

        if (!result.rows.length) {
            const error = new Error("Negotiation not found.");
            error.statusCode = 404;
            throw error;
        }

        const negotiation = result.rows[0];

        if (negotiation.status !== "PENDING") {
            const error = new Error(
                "This negotiation has already been resolved."
            );
            error.statusCode = 400;
            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | REJECT
        |--------------------------------------------------------------------------
        */

        if (action === "REJECTED") {
            await client.query(
                `
                UPDATE negotiation_requests
                SET
                    status = 'REJECTED',
                    resolved_at = CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                [negotiationId]
            );

            await client.query(
                `
                UPDATE quotations
                SET
                    status = 'SENT',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                [negotiation.quotation_id]
            );

            await model.addHistory(client, {
                negotiationId,
                actionBy: userId,
                action: "REJECTED",
                message
            });

            await client.query(
                `
                INSERT INTO audit_logs (
                    user_id,
                    entity_type,
                    entity_id,
                    action,
                    reason
                )
                VALUES (
                    $1,
                    'QUOTATION',
                    $2,
                    'NEGOTIATION_REJECTED',
                    $3
                )
                `,
                [userId, negotiation.quotation_id, message || null]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | COUNTER
        |--------------------------------------------------------------------------
        */

        if (action === "COUNTERED") {
            await client.query(
                `
                UPDATE negotiation_requests
                SET
                    status = 'COUNTERED',
                    resolved_at = CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                [negotiationId]
            );

            await model.addHistory(client, {
                negotiationId,
                actionBy: userId,
                action: "COUNTERED",
                message
            });

            await client.query(
                `
                INSERT INTO audit_logs (
                    user_id,
                    entity_type,
                    entity_id,
                    action,
                    reason
                )
                VALUES (
                    $1,
                    'QUOTATION',
                    $2,
                    'NEGOTIATION_COUNTERED',
                    $3
                )
                `,
                [userId, negotiation.quotation_id, message || null]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ACCEPT
        |--------------------------------------------------------------------------
        |
        | Customer's requested commercial changes are applied and then evaluated
        | through the existing discount evaluation engine.
        |--------------------------------------------------------------------------
        */

        if (action === "ACCEPTED") {
            const negotiationItems = await client.query(
                `
                SELECT *
                FROM negotiation_items
                WHERE negotiation_id = $1
                `,
                [negotiationId]
            );


            /*
            |--------------------------------------------------------------------------
            | Apply requested changes
            |--------------------------------------------------------------------------
            */

            for (const item of negotiationItems.rows) {
                const quotationItemResult = await client.query(
                    `
                    SELECT *
                    FROM quotation_items
                    WHERE id = $1
                      AND quotation_id = $2
                    FOR UPDATE
                    `,
                    [item.quotation_item_id, negotiation.quotation_id]
                );

                if (!quotationItemResult.rows.length) {
                    const error = new Error(
                        "Negotiated quotation item no longer exists."
                    );
                    error.statusCode = 400;
                    throw error;
                }

                const current = quotationItemResult.rows[0];

                const newQuantity = item.requested_quantity ?? current.quantity;
                const newUnitPrice = item.requested_unit_price ?? current.unit_price;
                const newDiscount = item.requested_discount_percent ?? current.discount_percent;

                const gross = Number(newQuantity) * Number(newUnitPrice);
                const discountAmount = gross * (Number(newDiscount) / 100);
                const afterDiscount = gross - discountAmount;
                const taxAmount = afterDiscount * (Number(current.tax_rate) / 100);
                const lineTotal = afterDiscount + taxAmount;

                await client.query(
                    `
                    UPDATE quotation_items
                    SET
                        quantity = $1,
                        unit_price = $2,
                        discount_percent = $3,
                        discount_amount = $4,
                        line_total = $5,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $6
                    `,
                    [
                        newQuantity,
                        newUnitPrice,
                        newDiscount,
                        discountAmount,
                        lineTotal,
                        item.quotation_item_id
                    ]
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Recalculate quotation totals
            |--------------------------------------------------------------------------
            */

            await client.query(
                `
                UPDATE quotations q
                SET
                    subtotal = totals.subtotal,
                    discount_amount = totals.discount_amount,
                    tax_amount = totals.tax_amount,
                    total_amount = totals.total_amount,
                    updated_at = CURRENT_TIMESTAMP
                FROM (
                    SELECT
                        quotation_id,
                        COALESCE(SUM(quantity * unit_price), 0) AS subtotal,
                        COALESCE(SUM(discount_amount), 0) AS discount_amount,
                        COALESCE(
                            SUM(
                                (quantity * unit_price - discount_amount) * tax_rate / 100
                            ),
                            0
                        ) AS tax_amount,
                        COALESCE(SUM(line_total), 0) AS total_amount
                    FROM quotation_items
                    WHERE quotation_id = $1
                    GROUP BY quotation_id
                ) totals
                WHERE q.id = totals.quotation_id
                `,
                [negotiation.quotation_id]
            );


            /*
            |--------------------------------------------------------------------------
            | Mark negotiation accepted
            |--------------------------------------------------------------------------
            */

            await client.query(
                `
                UPDATE negotiation_requests
                SET
                    status = 'ACCEPTED',
                    resolved_at = CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                [negotiationId]
            );

            await model.addHistory(client, {
                negotiationId,
                actionBy: userId,
                action: "ACCEPTED",
                message
            });

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
                    'NEGOTIATION_ACCEPTED',
                    $3,
                    $4,
                    $5
                )
                `,
                [
                    userId,
                    negotiation.quotation_id,
                    JSON.stringify({ status: "NEGOTIATING" }),
                    JSON.stringify({ status: "PENDING_EVALUATION" }),
                    message || null
                ]
            );
        }

        await client.query("COMMIT");

        // Post-commit: invoke discount evaluation engine on the updated quotation
        if (action === "ACCEPTED") {
            try {
                await quotationService.submitQuotation(negotiation.quotation_id, userId);
            } catch (evalError) {
                console.error("Error evaluating quote post negotiation accept:", evalError);
            }
        }

        return model.getNegotiationDetails(negotiationId);

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}


module.exports = {
    createNegotiation,
    getMyNegotiations,
    getDetails,
    getPendingNegotiations,
    respond
};
