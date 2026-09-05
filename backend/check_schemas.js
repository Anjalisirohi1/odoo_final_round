const { pool } = require('./src/config/db');
pool.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('approval_requests', 'approval_history', 'audit_logs') ORDER BY table_name, ordinal_position")
  .then(res => { 
    const tables = {};
    res.rows.forEach(r => {
      if(!tables[r.table_name]) tables[r.table_name] = [];
      tables[r.table_name].push(`${r.column_name} (${r.data_type})`);
    });
    console.log(JSON.stringify(tables, null, 2));
    pool.end(); 
  })
  .catch(err => { console.error(err); pool.end(); });
