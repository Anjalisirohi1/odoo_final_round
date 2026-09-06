const { pool } = require("./src/config/db");

async function migrateRevenue() {
  const client = await pool.connect();
  try {
    console.log("Starting Subscription and Invoice DB migrations...");
    await client.query("BEGIN");

    // 1. Create Subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_number VARCHAR(100) UNIQUE NOT NULL,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
        plan_name VARCHAR(150) NOT NULL,
        billing_cycle VARCHAR(50) NOT NULL DEFAULT 'MONTHLY',
        amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
        mrr NUMERIC(12,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        start_date DATE DEFAULT CURRENT_DATE,
        next_billing_date DATE,
        auto_renew BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create Invoices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
        subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
        amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
        tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
        total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
        due_date DATE,
        payment_method VARCHAR(100),
        paid_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    `);

    // 4. Seed initial sample data if tables are empty
    const subCheck = await client.query("SELECT COUNT(*) FROM subscriptions");
    if (parseInt(subCheck.rows[0].count) === 0) {
      console.log("Seeding sample subscriptions...");
      const custRes = await client.query("SELECT id, company_name FROM customers LIMIT 5");
      const customers = custRes.rows;
      
      const sampleSubs = [
        { num: 'SUB-1048', plan: 'Enterprise Cloud SLA', cycle: 'ANNUAL', amt: 120000.00, mrr: 10000.00, status: 'ACTIVE', nextDate: '2026-11-15' },
        { num: 'SUB-1047', plan: 'Pro Analytics Suite', cycle: 'MONTHLY', amt: 45000.00, mrr: 45000.00, status: 'ACTIVE', nextDate: '2026-10-01' },
        { num: 'SUB-1046', plan: 'Standard Hardware Support', cycle: 'QUARTERLY', amt: 30000.00, mrr: 10000.00, status: 'PENDING_RENEWAL', nextDate: '2026-09-20' },
        { num: 'SUB-1045', plan: 'Developer API Tier', cycle: 'MONTHLY', amt: 15000.00, mrr: 15000.00, status: 'PAST_DUE', nextDate: '2026-09-01' },
        { num: 'SUB-1044', plan: 'Enterprise Custom SLA', cycle: 'ANNUAL', amt: 240000.00, mrr: 20000.00, status: 'ACTIVE', nextDate: '2026-12-31' }
      ];

      for (let i = 0; i < sampleSubs.length; i++) {
        const sub = sampleSubs[i];
        const custId = customers[i % customers.length]?.id || null;
        await client.query(`
          INSERT INTO subscriptions (subscription_number, customer_id, plan_name, billing_cycle, amount, mrr, status, next_billing_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [sub.num, custId, sub.plan, sub.cycle, sub.amt, sub.mrr, sub.status, sub.nextDate]);
      }
    }

    const invCheck = await client.query("SELECT COUNT(*) FROM invoices");
    if (parseInt(invCheck.rows[0].count) === 0) {
      console.log("Seeding sample invoices...");
      const custRes = await client.query("SELECT id FROM customers LIMIT 5");
      const subRes = await client.query("SELECT id FROM subscriptions LIMIT 5");
      const customers = custRes.rows;
      const subs = subRes.rows;

      const sampleInvoices = [
        { num: 'INV-2094', amt: 100000.00, tax: 18000.00, total: 118000.00, status: 'PAID', dueDate: '2026-09-15', method: 'BANK_TRANSFER', paidAt: '2026-09-02' },
        { num: 'INV-2093', amt: 45000.00, tax: 8100.00, total: 53100.00, status: 'UNPAID', dueDate: '2026-09-25', method: 'CREDIT_CARD', paidAt: null },
        { num: 'INV-2092', amt: 30000.00, tax: 5400.00, total: 35400.00, status: 'OVERDUE', dueDate: '2026-08-30', method: 'STRIPE', paidAt: null },
        { num: 'INV-2091', amt: 15000.00, tax: 2700.00, total: 17700.00, status: 'PARTIAL', dueDate: '2026-09-10', method: 'UPI', paidAt: null },
        { num: 'INV-2090', amt: 240000.00, tax: 43200.00, total: 283200.00, status: 'PAID', dueDate: '2026-08-15', method: 'BANK_TRANSFER', paidAt: '2026-08-14' }
      ];

      for (let i = 0; i < sampleInvoices.length; i++) {
        const inv = sampleInvoices[i];
        const custId = customers[i % customers.length]?.id || null;
        const subId = subs[i % subs.length]?.id || null;
        await client.query(`
          INSERT INTO invoices (invoice_number, customer_id, subscription_id, amount, tax_amount, total_amount, status, due_date, payment_method, paid_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [inv.num, custId, subId, inv.amt, inv.tax, inv.total, inv.status, inv.dueDate, inv.method, inv.paidAt]);
      }
    }

    await client.query("COMMIT");
    console.log("Subscriptions and Invoices tables migrated successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrateRevenue();
