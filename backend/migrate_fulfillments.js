require("dotenv").config();
const { Pool } = require("pg");

const pgURI = process.env.DATABASE_URL || process.env.POSTGRES_URI;

const pool = new Pool({
  connectionString: pgURI,
});

async function migrateFulfillments() {
  const client = await pool.connect();

  try {
    console.log("Starting Fulfillment Migrations...");
    await client.query("BEGIN");

    // 1. Warehouses
    console.log("Creating warehouses table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS warehouses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(150) NOT NULL,
          code VARCHAR(50) UNIQUE NOT NULL,
          location VARCHAR(255),
          capacity_units NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (capacity_units >= 0),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed some warehouses if they don't exist
    const { rowCount: wCount } = await client.query(`SELECT 1 FROM warehouses LIMIT 1`);
    if (wCount === 0) {
      console.log("Seeding warehouses...");
      await client.query(`
        INSERT INTO warehouses (name, code, location, capacity_units)
        VALUES
        ('Bengaluru Central', 'BLR-CENTRAL', 'Bengaluru', 1000),
        ('Mumbai Logistics Hub', 'MUM-HUB', 'Mumbai', 1500),
        ('Delhi Regional Depot', 'DEL-DEPOT', 'Delhi', 1200);
      `);
    }

    // 2. Warehouse Inventory
    console.log("Creating warehouse_inventory table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS warehouse_inventory (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          warehouse_id UUID NOT NULL,
          product_id UUID NOT NULL,
          available_quantity NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
          reserved_quantity NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
          reorder_level NUMERIC(14,2) DEFAULT 0,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_inventory_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
          CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          CONSTRAINT unique_warehouse_product UNIQUE (warehouse_id, product_id)
      );
    `);

    // 3. Fulfillments
    console.log("Creating fulfillments table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS fulfillments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          fulfillment_number VARCHAR(50) UNIQUE NOT NULL,
          quotation_id UUID NOT NULL,
          customer_id UUID NOT NULL,
          status VARCHAR(30) NOT NULL DEFAULT 'PROCESSING'
              CHECK (status IN ('PROCESSING', 'READY_TO_SHIP', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'ON_HOLD', 'CANCELLED')),
          progress_percent NUMERIC(5,2) DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
          expected_delivery_date DATE,
          actual_delivery_date DATE,
          tracking_number VARCHAR(100),
          carrier VARCHAR(100),
          notes TEXT,
          created_by UUID,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_fulfillment_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id),
          CONSTRAINT fk_fulfillment_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
          CONSTRAINT fk_fulfillment_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Create Indexes
    console.log("Creating indexes for fulfillments...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_fulfillment_status ON fulfillments(status);
      CREATE INDEX IF NOT EXISTS idx_fulfillment_customer ON fulfillments(customer_id);
      CREATE INDEX IF NOT EXISTS idx_fulfillment_quotation ON fulfillments(quotation_id);
      CREATE INDEX IF NOT EXISTS idx_fulfillment_delivery ON fulfillments(expected_delivery_date);
      CREATE INDEX IF NOT EXISTS idx_fulfillment_updated ON fulfillments(updated_at DESC);
    `);

    // 4. Fulfillment Items
    console.log("Creating fulfillment_items table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS fulfillment_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          fulfillment_id UUID NOT NULL,
          quotation_item_id UUID NOT NULL,
          product_id UUID NOT NULL,
          ordered_quantity NUMERIC(14,2) NOT NULL,
          allocated_quantity NUMERIC(14,2) DEFAULT 0,
          shipped_quantity NUMERIC(14,2) DEFAULT 0,
          delivered_quantity NUMERIC(14,2) DEFAULT 0,
          backordered_quantity NUMERIC(14,2) DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_fulfillment_item_fulfillment FOREIGN KEY (fulfillment_id) REFERENCES fulfillments(id) ON DELETE CASCADE,
          CONSTRAINT fk_fulfillment_item_quote FOREIGN KEY (quotation_item_id) REFERENCES quotation_items(id),
          CONSTRAINT fk_fulfillment_item_product FOREIGN KEY (product_id) REFERENCES products(id),
          CONSTRAINT unique_fulfillment_quote_item UNIQUE (fulfillment_id, quotation_item_id)
      );
    `);

    // 5. Fulfillment Allocations
    console.log("Creating fulfillment_allocations table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS fulfillment_allocations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          fulfillment_item_id UUID NOT NULL,
          warehouse_id UUID NOT NULL,
          allocated_quantity NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (allocated_quantity >= 0),
          shipped_quantity NUMERIC(14,2) DEFAULT 0,
          delivered_quantity NUMERIC(14,2) DEFAULT 0,
          status VARCHAR(30) DEFAULT 'ALLOCATED'
              CHECK (status IN ('ALLOCATED', 'PACKING', 'READY', 'SHIPPED', 'DELIVERED', 'BACKORDERED')),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_allocation_item FOREIGN KEY (fulfillment_item_id) REFERENCES fulfillment_items(id) ON DELETE CASCADE,
          CONSTRAINT fk_allocation_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
      );
    `);

    // 6. Fulfillment Activity
    console.log("Creating fulfillment_activity table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS fulfillment_activity (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          fulfillment_id UUID NOT NULL,
          action VARCHAR(50) NOT NULL,
          description TEXT,
          performed_by UUID,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_activity_fulfillment FOREIGN KEY (fulfillment_id) REFERENCES fulfillments(id) ON DELETE CASCADE,
          CONSTRAINT fk_activity_user FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_fulfillment_activity_created ON fulfillment_activity(created_at DESC);
    `);

    await client.query("COMMIT");
    console.log("Fulfillment migrations completed successfully!");

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
  } finally {
    client.release();
    pool.end();
  }
}

migrateFulfillments();
