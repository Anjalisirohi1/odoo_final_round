const {Pool}=require('pg');
require('dotenv').config();
const p=new Pool({connectionString:process.env.DATABASE_URL});
p.query("SELECT column_name FROM information_schema.columns WHERE table_name='approval_requests' ORDER BY ordinal_position")
.then(r=>{console.log(r.rows.map(x=>x.column_name).join(', ')); p.end();});
