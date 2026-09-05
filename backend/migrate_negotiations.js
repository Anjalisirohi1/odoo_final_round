require("dotenv").config();
const { pool } = require("./src/config/db");

async function migrateNegotiations() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Creating negotiation_requests table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS negotiation_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

          quotation_id UUID NOT NULL,
          customer_id UUID NOT NULL,

          requested_by UUID,

          status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
              CHECK (
                  status IN (
                      'PENDING',
                      'ACCEPTED',
                      'REJECTED',
                      'COUNTERED',
                      'CANCELLED'
                  )
              ),

          message TEXT,

          requested_delivery_date DATE,

          requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          resolved_at TIMESTAMPTZ,

          CONSTRAINT fk_negotiation_quotation
              FOREIGN KEY (quotation_id)
              REFERENCES quotations(id)
              ON DELETE CASCADE,

          CONSTRAINT fk_negotiation_customer
              FOREIGN KEY (customer_id)
              REFERENCES customers(id)
              ON DELETE CASCADE,

          CONSTRAINT fk_negotiation_user
              FOREIGN KEY (requested_by)
              REFERENCES users(id)
              ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_negotiation_quotation
      ON negotiation_requests(quotation_id);

      CREATE INDEX IF NOT EXISTS idx_negotiation_customer
      ON negotiation_requests(customer_id);

      CREATE INDEX IF NOT EXISTS idx_negotiation_status
      ON negotiation_requests(status);
    `);

    console.log("Creating negotiation_items table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS negotiation_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

          negotiation_id UUID NOT NULL,
          quotation_item_id UUID NOT NULL,

          requested_quantity NUMERIC(12,2),
          requested_unit_price NUMERIC(12,2),
          requested_discount_percent NUMERIC(5,2),

          customer_note TEXT,

          CONSTRAINT fk_negotiation_item_request
              FOREIGN KEY (negotiation_id)
              REFERENCES negotiation_requests(id)
              ON DELETE CASCADE,

          CONSTRAINT fk_negotiation_item_quote
              FOREIGN KEY (quotation_item_id)
              REFERENCES quotation_items(id)
              ON DELETE CASCADE,

          CONSTRAINT chk_negotiation_quantity
              CHECK (
                  requested_quantity IS NULL
                  OR requested_quantity > 0
              ),

          CONSTRAINT chk_negotiation_price
              CHECK (
                  requested_unit_price IS NULL
                  OR requested_unit_price >= 0
              ),

          CONSTRAINT chk_negotiation_discount
              CHECK (
                  requested_discount_percent IS NULL
                  OR (
                      requested_discount_percent >= 0
                      AND requested_discount_percent <= 100
                  )
              )
      );

      CREATE INDEX IF NOT EXISTS idx_negotiation_items_request
      ON negotiation_items(negotiation_id);
    `);

    console.log("Creating negotiation_history table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS negotiation_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

          negotiation_id UUID NOT NULL,

          action_by UUID,

          action VARCHAR(30) NOT NULL
              CHECK (
                  action IN (
                      'SUBMITTED',
                      'ACCEPTED',
                      'REJECTED',
                      'COUNTERED',
                      'CANCELLED'
                  )
              ),

          message TEXT,

          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT fk_negotiation_history_request
              FOREIGN KEY (negotiation_id)
              REFERENCES negotiation_requests(id)
              ON DELETE CASCADE,

          CONSTRAINT fk_negotiation_history_user
              FOREIGN KEY (action_by)
              REFERENCES users(id)
              ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_negotiation_history_request
      ON negotiation_history(negotiation_id);
    `);

    await client.query("COMMIT");
    console.log("Negotiations tables and indexes migrated successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
  } finally {
    client.release();
    pool.end();
  }
}

migrateNegotiations();
