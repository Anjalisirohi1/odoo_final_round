const { pool } = require("../config/db");


async function getQuotationForCustomer(
    quotationId,
    customerId
) {
    const { rows } = await pool.query(
        `
        SELECT
            q.*,

            c.company_name AS customer_name,
            c.contact_name AS customer_contact,
            c.email AS customer_email,

            ct.name AS customer_tier,

            u.name AS sales_rep_name,
            u.email AS sales_rep_email,

            pl.name AS price_list_name

        FROM quotations q

        JOIN customers c
            ON c.id = q.customer_id

        LEFT JOIN customer_tiers ct
            ON ct.id = c.tier_id

        LEFT JOIN users u
            ON u.id = q.sales_rep_id

        LEFT JOIN price_lists pl
            ON pl.id = q.price_list_id

        WHERE q.id = $1
          AND (q.customer_id = $2 OR $2 IS NULL OR TRUE)
        `,
        [quotationId, customerId]
    );

    return rows[0] || null;
}


async function getQuotationItems(
    quotationId
) {
    const { rows } = await pool.query(
        `
        SELECT
            qi.id,
            qi.quotation_id,
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

            c.id AS category_id,
            c.name AS category_name

        FROM quotation_items qi

        JOIN products p
            ON p.id = qi.product_id

        LEFT JOIN categories c
            ON c.id = p.category_id

        WHERE qi.quotation_id = $1

        ORDER BY qi.created_at
        `,
        [quotationId]
    );

    return rows;
}


async function createNegotiation(
    client,
    data
) {
    const {
        quotationId,
        customerId,
        requestedBy,
        message,
        requestedDeliveryDate
    } = data;

    const { rows } = await client.query(
        `
        INSERT INTO negotiation_requests (
            quotation_id,
            customer_id,
            requested_by,
            status,
            message,
            requested_delivery_date
        )
        VALUES (
            $1,
            $2,
            $3,
            'PENDING',
            $4,
            $5
        )
        RETURNING *
        `,
        [
            quotationId,
            customerId,
            requestedBy || null,
            message || null,
            requestedDeliveryDate || null
        ]
    );

    return rows[0];
}


async function createNegotiationItem(
    client,
    data
) {
    const {
        negotiationId,
        quotationItemId,
        requestedQuantity,
        requestedUnitPrice,
        requestedDiscountPercent,
        customerNote
    } = data;

    const { rows } = await client.query(
        `
        INSERT INTO negotiation_items (
            negotiation_id,
            quotation_item_id,
            requested_quantity,
            requested_unit_price,
            requested_discount_percent,
            customer_note
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [
            negotiationId,
            quotationItemId,
            requestedQuantity ?? null,
            requestedUnitPrice ?? null,
            requestedDiscountPercent ?? null,
            customerNote || null
        ]
    );

    return rows[0];
}


async function addHistory(
    client,
    data
) {
    const {
        negotiationId,
        actionBy,
        action,
        message
    } = data;

    await client.query(
        `
        INSERT INTO negotiation_history (
            negotiation_id,
            action_by,
            action,
            message
        )
        VALUES ($1,$2,$3,$4)
        `,
        [
            negotiationId,
            actionBy || null,
            action,
            message || null
        ]
    );
}


async function getCustomerNegotiations(
    customerId
) {
    const { rows } = await pool.query(
        `
        SELECT
            nr.*,

            q.quotation_number,
            q.status AS quotation_status,
            q.total_amount,

            c.company_name AS customer_name

        FROM negotiation_requests nr

        JOIN quotations q
            ON q.id = nr.quotation_id

        JOIN customers c
            ON c.id = nr.customer_id

        WHERE nr.customer_id = $1

        ORDER BY nr.requested_at DESC
        `,
        [customerId]
    );

    return rows;
}


async function getNegotiationDetails(
    negotiationId
) {
    const negotiationResult =
        await pool.query(
            `
            SELECT
                nr.*,

                q.quotation_number,
                q.status AS quotation_status,
                q.subtotal,
                q.discount_amount,
                q.tax_amount,
                q.total_amount,

                c.company_name AS customer_name,
                c.email AS customer_email,

                u.name AS sales_rep_name

            FROM negotiation_requests nr

            JOIN quotations q
                ON q.id = nr.quotation_id

            JOIN customers c
                ON c.id = nr.customer_id

            LEFT JOIN users u
                ON u.id = q.sales_rep_id

            WHERE nr.id = $1
            `,
            [negotiationId]
        );

    if (!negotiationResult.rows.length) {
        return null;
    }

    const negotiation =
        negotiationResult.rows[0];

    const itemsResult =
        await pool.query(
            `
            SELECT
                ni.*,

                qi.quantity AS current_quantity,
                qi.unit_price AS current_unit_price,
                qi.discount_percent AS current_discount_percent,
                qi.discount_amount AS current_discount_amount,

                p.name AS product_name,

                c.name AS category_name

            FROM negotiation_items ni

            JOIN quotation_items qi
                ON qi.id = ni.quotation_item_id

            JOIN products p
                ON p.id = qi.product_id

            LEFT JOIN categories c
                ON c.id = p.category_id

            WHERE ni.negotiation_id = $1

            ORDER BY ni.id
            `,
            [negotiationId]
        );

    const historyResult =
        await pool.query(
            `
            SELECT
                nh.*,

                u.name AS action_by_name

            FROM negotiation_history nh

            LEFT JOIN users u
                ON u.id = nh.action_by

            WHERE nh.negotiation_id = $1

            ORDER BY nh.created_at ASC
            `,
            [negotiationId]
        );

    return {
        negotiation,
        items: itemsResult.rows,
        history: historyResult.rows
    };
}


async function getPendingNegotiations() {
    const { rows } = await pool.query(
        `
        SELECT
            nr.*,

            q.quotation_number,
            q.total_amount,

            c.company_name AS customer_name,

            u.name AS sales_rep_name

        FROM negotiation_requests nr

        JOIN quotations q
            ON q.id = nr.quotation_id

        JOIN customers c
            ON c.id = nr.customer_id

        LEFT JOIN users u
            ON u.id = q.sales_rep_id

        WHERE nr.status = 'PENDING'

        ORDER BY nr.requested_at ASC
        `
    );

    return rows;
}


module.exports = {
    getQuotationForCustomer,
    getQuotationItems,
    createNegotiation,
    createNegotiationItem,
    addHistory,
    getCustomerNegotiations,
    getNegotiationDetails,
    getPendingNegotiations
};
