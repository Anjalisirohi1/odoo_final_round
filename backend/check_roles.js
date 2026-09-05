const { pool } = require('./src/config/db');
pool.query("SELECT * FROM roles")
  .then(res => { console.log(res.rows); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
