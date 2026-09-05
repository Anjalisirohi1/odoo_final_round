const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // =============================================
    // STEP 1: Add missing columns to existing tables
    // =============================================

    // customers: add industry, region (tier already via tier_id FK)
    await client.query(`
      ALTER TABLE customers
        ADD COLUMN IF NOT EXISTS industry  VARCHAR(100),
        ADD COLUMN IF NOT EXISTS region    VARCHAR(100);
    `);

    // products: add cost_price, margin_percentage, selling_price alias
    await client.query(`
      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS cost_price          NUMERIC(14,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS margin_percentage   NUMERIC(6,2)
          GENERATED ALWAYS AS (
            CASE WHEN price > 0
              THEN ROUND(((price - cost_price) / price) * 100, 2)
            ELSE 0 END
          ) STORED;
    `);

    // quotations: add total_discount, total_margin
    await client.query(`
      ALTER TABLE quotations
        ADD COLUMN IF NOT EXISTS total_discount  NUMERIC(14,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_margin    NUMERIC(14,2) DEFAULT 0;
    `);

    // quotation_items: add original_price, final_price, cost_price, margin_amount
    await client.query(`
      ALTER TABLE quotation_items
        ADD COLUMN IF NOT EXISTS original_price  NUMERIC(14,2),
        ADD COLUMN IF NOT EXISTS final_price     NUMERIC(14,2),
        ADD COLUMN IF NOT EXISTS cost_price      NUMERIC(14,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS margin_amount   NUMERIC(14,2) DEFAULT 0;
    `);

    // users: add team_id, region for sales rep context
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS team_id  VARCHAR(100),
        ADD COLUMN IF NOT EXISTS region   VARCHAR(100);
    `);

    console.log('✅ Step 1: Existing table columns updated');

    // =============================================
    // STEP 2: Create WAREHOUSES
    // =============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS warehouses (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        warehouse_name   VARCHAR(200) NOT NULL,
        region           VARCHAR(100),
        city             VARCHAR(100),
        active           BOOLEAN DEFAULT TRUE,
        created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Step 2: warehouses table created');

    // =============================================
    // STEP 3: Create ORDERS
    // =============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
        quotation_id   UUID REFERENCES quotations(id) ON DELETE SET NULL,
        order_date     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        total_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
        status         VARCHAR(50) NOT NULL DEFAULT 'PENDING'
                         CHECK (status IN ('PENDING','CONFIRMED','PROCESSING',
                                           'SHIPPED','DELIVERED','CANCELLED')),
        created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_orders_customer    ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_quotation   ON orders(quotation_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
    `);
    console.log('✅ Step 3: orders table created');

    // =============================================
    // STEP 4: Create ORDER_ITEMS
    // =============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id          UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        quantity            NUMERIC(10,2) NOT NULL DEFAULT 1,
        unit_price          NUMERIC(14,2) NOT NULL DEFAULT 0,
        discount_percentage NUMERIC(5,2)  DEFAULT 0,
        created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
    `);
    console.log('✅ Step 4: order_items table created');

    // =============================================
    // STEP 5: Create INVENTORY
    // =============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        warehouse_id         UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
        product_id           UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        available_quantity   NUMERIC(12,2) NOT NULL DEFAULT 0,
        reserved_quantity    NUMERIC(12,2) NOT NULL DEFAULT 0,
        updated_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(warehouse_id, product_id)
      );
      CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_product   ON inventory(product_id);
    `);
    console.log('✅ Step 5: inventory table created');

    // =============================================
    // STEP 6: Create FULFILLMENTS
    // =============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS fulfillments (
        id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id                UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        warehouse_id            UUID REFERENCES warehouses(id) ON DELETE SET NULL,
        promised_delivery_date  DATE,
        shipped_date            DATE,
        actual_delivery_date    DATE,
        status                  VARCHAR(50) NOT NULL DEFAULT 'PENDING'
                                  CHECK (status IN ('PENDING','PROCESSING',
                                                    'SHIPPED','DELIVERED','FAILED')),
        created_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_fulfillments_order     ON fulfillments(order_id);
      CREATE INDEX IF NOT EXISTS idx_fulfillments_warehouse ON fulfillments(warehouse_id);
    `);
    console.log('✅ Step 6: fulfillments table created');

    // =============================================
    // STEP 7: Create DEAL_EVENTS
    // =============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS deal_events (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id  UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
        event_type    VARCHAR(60) NOT NULL
                        CHECK (event_type IN (
                          'QUOTE_CREATED','PRODUCT_ADDED','PRODUCT_REMOVED',
                          'DISCOUNT_APPLIED','DISCOUNT_CHANGED','QUOTE_SENT',
                          'CUSTOMER_VIEWED','CUSTOMER_COMMENTED','COUNTER_OFFER',
                          'QUOTE_REVISED','APPROVAL_REQUESTED','APPROVED',
                          'REJECTED','ORDER_CONFIRMED','INVENTORY_RESERVED',
                          'SHIPMENT_CREATED','DELIVERED'
                        )),
        actor_id      UUID,
        actor_type    VARCHAR(30) DEFAULT 'SYSTEM'
                        CHECK (actor_type IN ('SALES_REP','CUSTOMER','SYSTEM','MANAGER')),
        metadata      JSONB DEFAULT '{}'::jsonb,
        created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_deal_events_quotation   ON deal_events(quotation_id);
      CREATE INDEX IF NOT EXISTS idx_deal_events_event_type  ON deal_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_deal_events_created_at  ON deal_events(created_at DESC);
    `);
    console.log('✅ Step 7: deal_events table created');

    // =============================================
    // STEP 8: Seed one default warehouse
    // =============================================
    await client.query(`
      INSERT INTO warehouses (warehouse_name, region, city, active)
      VALUES ('Main Warehouse', 'Central', 'Delhi', TRUE)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Step 8: Default warehouse seeded');

    await client.query('COMMIT');
    console.log('\n🎉 Migration complete! All ML data contract tables are ready.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
};

run();
