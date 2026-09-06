const { pool } = require('./src/config/db');
async function run() {
  try {
    const res = await pool.query('SELECT id, total_amount FROM quotations WHERE status = \'DRAFT\' OR status = \'PENDING_APPROVAL\' LIMIT 2');
    const q1 = res.rows[0];
    const q2 = res.rows[1];
    
    if (q1) {
      await pool.query("UPDATE quotations SET created_at = NOW() - INTERVAL '45 days', discount_amount = total_amount * 0.40 WHERE id = $1", [q1.id]);
      await pool.query("UPDATE inventory SET available_quantity = 2 WHERE product_id IN (SELECT product_id FROM quotation_items WHERE quotation_id = $1)", [q1.id]);
    }
    if (q2) {
      await pool.query("UPDATE quotations SET created_at = NOW() - INTERVAL '35 days', discount_amount = total_amount * 0.35 WHERE id = $1", [q2.id]);
      await pool.query("UPDATE inventory SET available_quantity = 3 WHERE product_id IN (SELECT product_id FROM quotation_items WHERE quotation_id = $1)", [q2.id]);
    }
    await pool.query('TRUNCATE deal_health_scores');
    console.log('Successfully injected critical deals and cleared health scores');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
