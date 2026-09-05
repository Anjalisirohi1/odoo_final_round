const { pool } = require('./src/config/db');
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
  .then(res => { console.log(res.rows.map(r => r.table_name).join(', ')); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
