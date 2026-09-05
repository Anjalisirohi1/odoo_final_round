const approvalService = require('./src/services/approvalService');

async function run() {
  try {
    const { pool } = require('./src/config/db');
    const managerRes = await pool.query("SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'SALES_MANAGER') LIMIT 1");
    if (!managerRes.rows.length) return console.log('No manager found');
    const managerId = managerRes.rows[0].id;

    console.log('Fetching for manager:', managerId);
    const data = await approvalService.getPendingApprovals(managerId);
    console.log('Result:', data);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
run();
