const { pool } = require("../config/db");

/*
|--------------------------------------------------------------------------
| Dashboard summary
|--------------------------------------------------------------------------
*/

async function getSummary() {
    const { rows } = await pool.query(`
        SELECT
            COUNT(*) FILTER (
                WHERE status NOT IN ('CANCELLED', 'DELIVERED')
            ) AS total_active,

            COUNT(*) FILTER (
                WHERE status = 'PROCESSING'
            ) AS processing,

            COUNT(*) FILTER (
                WHERE status = 'READY_TO_SHIP'
            ) AS ready_to_ship,

            COUNT(*) FILTER (
                WHERE status = 'IN_TRANSIT'
            ) AS in_transit,

            COUNT(*) FILTER (
                WHERE status = 'DELIVERED'
            ) AS delivered,

            COUNT(*) FILTER (
                WHERE status = 'DELAYED'
            ) AS delayed
        FROM fulfillments
    `);

    return rows[0];
}

/*
|--------------------------------------------------------------------------
| Fulfillment list
|--------------------------------------------------------------------------
*/

async function getFulfillments(filters = {}) {
    const {
        search,
        status,
        warehouseId,
        fromDate,
        toDate,
        page = 1,
        limit = 10
    } = filters;

    const values = [];
    const conditions = [];
    let index = 1;

    /* Search */
    if (search) {
        values.push(`%${search}%`);
        conditions.push(`
            (
                f.fulfillment_number ILIKE $${index}
                OR q.quotation_number ILIKE $${index}
                OR c.company_name ILIKE $${index}
                OR f.tracking_number ILIKE $${index}
            )
        `);
        index++;
    }

    /* Status */
    if (status) {
        values.push(status);
        conditions.push(`f.status = $${index}`);
        index++;
    }

    /* Warehouse */
    if (warehouseId) {
        values.push(warehouseId);
        conditions.push(`
            EXISTS (
                SELECT 1
                FROM fulfillment_items fi2
                JOIN fulfillment_allocations fa2
                    ON fa2.fulfillment_item_id = fi2.id
                WHERE fi2.fulfillment_id = f.id
                  AND fa2.warehouse_id = $${index}
            )
        `);
        index++;
    }

    /* Date range */
    if (fromDate) {
        values.push(fromDate);
        conditions.push(`f.expected_delivery_date >= $${index}`);
        index++;
    }

    if (toDate) {
        values.push(toDate);
        conditions.push(`f.expected_delivery_date <= $${index}`);
        index++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    /* Pagination */
    const offset = (Number(page) - 1) * Number(limit);
    values.push(Number(limit));
    const limitIndex = index++;
    values.push(offset);
    const offsetIndex = index++;

    const query = `
        SELECT
            f.id,
            f.fulfillment_number,
            q.quotation_number,
            c.company_name AS customer_name,
            f.status,
            f.progress_percent,
            f.expected_delivery_date,
            f.actual_delivery_date,
            f.tracking_number,
            f.carrier,
            f.created_at,
            f.updated_at,
            COALESCE(
                SUM(fi.ordered_quantity),
                0
            ) AS total_items,
            COALESCE(
                SUM(fi.backordered_quantity),
                0
            ) AS backordered_items
        FROM fulfillments f
        JOIN quotations q ON q.id = f.quotation_id
        JOIN customers c ON c.id = f.customer_id
        LEFT JOIN fulfillment_items fi ON fi.fulfillment_id = f.id
        ${whereClause}
        GROUP BY
            f.id,
            q.quotation_number,
            c.company_name
        ORDER BY
            f.updated_at DESC
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
    `;

    const result = await pool.query(query, values);

    /* Count */
    const countValues = values.slice(0, values.length - 2);
    const countQuery = `
        SELECT COUNT(*)
        FROM fulfillments f
        JOIN quotations q ON q.id = f.quotation_id
        JOIN customers c ON c.id = f.customer_id
        ${whereClause}
    `;

    const countResult = await pool.query(countQuery, countValues);

    return {
        rows: result.rows,
        total: Number(countResult.rows[0].count)
    };
}

/*
|--------------------------------------------------------------------------
| Warehouses
|--------------------------------------------------------------------------
*/

async function getWarehouses() {
    const { rows } = await pool.query(`
        SELECT
            id,
            name,
            code,
            location,
            capacity_units,
            is_active
        FROM warehouses
        WHERE is_active = TRUE
        ORDER BY name
    `);
    return rows;
}

/*
|--------------------------------------------------------------------------
| Warehouse capacity
|--------------------------------------------------------------------------
*/

async function getWarehouseCapacity() {
    const { rows } = await pool.query(`
        SELECT
            w.id,
            w.name,
            w.code,
            w.capacity_units,
            COALESCE(
                SUM(fa.allocated_quantity),
                0
            ) AS allocated_units
        FROM warehouses w
        LEFT JOIN fulfillment_allocations fa ON fa.warehouse_id = w.id
        WHERE w.is_active = TRUE
        GROUP BY
            w.id,
            w.name,
            w.code,
            w.capacity_units
        ORDER BY w.name
    `);

    return rows.map(row => {
        const capacity = Number(row.capacity_units);
        const allocated = Number(row.allocated_units);
        const utilization = capacity > 0 ? (allocated / capacity) * 100 : 0;

        return {
            id: row.id,
            name: row.name,
            code: row.code,
            capacity: capacity,
            allocated: allocated,
            utilization: Number(utilization.toFixed(1)),
            available: Math.max(capacity - allocated, 0)
        };
    });
}

/*
|--------------------------------------------------------------------------
| Requires attention
|--------------------------------------------------------------------------
*/

async function getRequiresAttention() {
    const { rows } = await pool.query(`
        SELECT
            f.id,
            f.fulfillment_number,
            q.quotation_number,
            c.company_name AS customer_name,
            f.status,
            f.expected_delivery_date,
            f.progress_percent,
            f.notes,
            CASE
                WHEN f.status = 'DELAYED' THEN 'DELAYED'
                WHEN f.expected_delivery_date < CURRENT_DATE AND f.status NOT IN ('DELIVERED', 'CANCELLED') THEN 'OVERDUE'
                WHEN EXISTS (
                    SELECT 1 FROM fulfillment_items fi
                    WHERE fi.fulfillment_id = f.id AND fi.backordered_quantity > 0
                ) THEN 'BACKORDER'
                WHEN f.status = 'ON_HOLD' THEN 'ON_HOLD'
                ELSE 'REVIEW'
            END AS attention_type
        FROM fulfillments f
        JOIN quotations q ON q.id = f.quotation_id
        JOIN customers c ON c.id = f.customer_id
        WHERE
            f.status IN ('DELAYED', 'ON_HOLD')
            OR (
                f.expected_delivery_date < CURRENT_DATE
                AND f.status NOT IN ('DELIVERED', 'CANCELLED')
            )
            OR EXISTS (
                SELECT 1 FROM fulfillment_items fi
                WHERE fi.fulfillment_id = f.id AND fi.backordered_quantity > 0
            )
        ORDER BY
            f.expected_delivery_date ASC
        LIMIT 10
    `);
    return rows;
}

/*
|--------------------------------------------------------------------------
| Recent activity
|--------------------------------------------------------------------------
*/

async function getRecentActivity() {
    const { rows } = await pool.query(`
        SELECT
            fa.id,
            fa.fulfillment_id,
            f.fulfillment_number,
            fa.action,
            fa.description,
            u.name AS performed_by,
            fa.created_at
        FROM fulfillment_activity fa
        JOIN fulfillments f ON f.id = fa.fulfillment_id
        LEFT JOIN users u ON u.id = fa.performed_by
        ORDER BY fa.created_at DESC
        LIMIT 10
    `);
    return rows;
}

/*
|--------------------------------------------------------------------------
| POST / Create API functions
|--------------------------------------------------------------------------
*/
async function checkInventory(client) {
    // Check inventory ordered by capacity descending (first come first serve across large warehouses)
    const { rows } = await client.query(`
        SELECT wi.warehouse_id, wi.product_id, wi.available_quantity, w.name AS warehouse_name
        FROM warehouse_inventory wi
        JOIN warehouses w ON w.id = wi.warehouse_id
        WHERE w.is_active = TRUE AND wi.available_quantity > 0
        ORDER BY w.capacity_units DESC
    `);
    return rows;
}

async function getQuotationItems(client, quotationId) {
    const { rows } = await client.query(`
        SELECT id, product_id, quantity
        FROM quotation_items
        WHERE quotation_id = $1
    `, [quotationId]);
    return rows;
}

module.exports = {
    getSummary,
    getFulfillments,
    getWarehouses,
    getWarehouseCapacity,
    getRequiresAttention,
    getRecentActivity,
    checkInventory,
    getQuotationItems,
    pool // Exporting pool for transaction management in service
};
