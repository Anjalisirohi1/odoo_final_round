const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const run = async () => {
    try {
        const managerRes = await pool.query("SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'SALES_MANAGER') LIMIT 1");
        if (!managerRes.rows.length) return console.log('No manager found');
        const managerId = managerRes.rows[0].id;

        const reqUserRes = await pool.query("SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'SALES_REP') LIMIT 1");
        const reqUserId = reqUserRes.rows[0].id;

        const quoteRes = await pool.query("SELECT id FROM quotations WHERE status = 'PENDING_APPROVAL' LIMIT 1");
        if (!quoteRes.rows.length) return console.log('No pending quotes found');
        const quoteId = quoteRes.rows[0].id;

        await pool.query(`
            INSERT INTO approval_requests (quotation_id, requested_by, assigned_to, approval_level, status, reason)
            VALUES ($1, $2, $3, 'MANAGER', 'PENDING', 'High discount requested')
            ON CONFLICT DO NOTHING
        `, [quoteId, reqUserId, managerId]);

        console.log('Inserted dummy approval request for manager:', managerId);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
