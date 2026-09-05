const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const convertDraftsToApprovals = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find the Sales Manager
    const managerRes = await client.query("SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'SALES_MANAGER') LIMIT 1");
    if (!managerRes.rows.length) {
      console.log("No SALES_MANAGER found in DB.");
      return;
    }
    const managerId = managerRes.rows[0].id;

    // Find all DRAFT quotations
    const draftsRes = await client.query("SELECT id, sales_rep_id FROM quotations WHERE status = 'DRAFT'");
    if (!draftsRes.rows.length) {
      console.log("No DRAFT quotations found.");
      return;
    }

    console.log(`Found ${draftsRes.rows.length} DRAFT quotations. Converting them to pending approvals assigned to manager ${managerId}...`);

    let count = 0;
    for (const draft of draftsRes.rows) {
      // Update quote to PENDING_APPROVAL
      await client.query("UPDATE quotations SET status = 'PENDING_APPROVAL' WHERE id = $1", [draft.id]);
      
      // Insert approval request
      await client.query(`
        INSERT INTO approval_requests (quotation_id, requested_by, assigned_to, approval_level, status, reason)
        VALUES ($1, $2, $3, 'MANAGER', 'PENDING', 'Automatic test conversion from draft')
        ON CONFLICT DO NOTHING
      `, [draft.id, draft.sales_rep_id, managerId]);
      count++;
    }

    await client.query('COMMIT');
    console.log(`Successfully converted ${count} drafts to pending approvals!`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error converting drafts:", error);
  } finally {
    client.release();
    pool.end();
  }
};

convertDraftsToApprovals();
