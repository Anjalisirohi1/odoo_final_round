const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const generateDummyDeals = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get random customers, products, and a sales rep
    const customersRes = await client.query('SELECT id FROM customers LIMIT 3');
    const productsRes = await client.query('SELECT id, price, cost_price FROM products LIMIT 5');
    const usersRes = await client.query("SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'SALES_REP') LIMIT 1");
    const priceListRes = await client.query('SELECT id FROM price_lists LIMIT 1');
    
    if (customersRes.rows.length === 0 || productsRes.rows.length === 0 || usersRes.rows.length === 0 || priceListRes.rows.length === 0) {
      throw new Error('Not enough base data to generate deals.');
    }

    const customers = customersRes.rows;
    const products = productsRes.rows;
    const salesRepId = usersRes.rows[0].id;
    const priceListId = priceListRes.rows[0].id;

    // Scenarios to generate:
    const scenarios = [
      {
        desc: 'Healthy, High Value, Fast Moving',
        status: 'NEGOTIATING',
        discount: 5,
        daysOld: 2,
        eventCount: 4,
        approval: 'APPROVED'
      },
      {
        desc: 'At Risk, High Discount, Low Margin',
        status: 'PENDING_APPROVAL',
        discount: 30,
        daysOld: 10,
        eventCount: 2,
        approval: 'PENDING'
      },
      {
        desc: 'Critical, Stale Deal, Rejected Approval',
        status: 'DRAFT',
        discount: 15,
        daysOld: 35,
        eventCount: 1,
        approval: 'REJECTED'
      },
      {
        desc: 'Excellent, Standard Deal',
        status: 'NEGOTIATING',
        discount: 0,
        daysOld: 1,
        eventCount: 5,
        approval: 'APPROVED'
      }
    ];

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      const customerId = customers[i % customers.length].id;
      
      const qNum = 'QT-DUMMY-' + Date.now() + '-' + i;
      const createdAt = new Date(Date.now() - scenario.daysOld * 24 * 60 * 60 * 1000).toISOString();

      // Create Quotation
      const qRes = await client.query(`
        INSERT INTO quotations (quotation_number, customer_id, sales_rep_id, price_list_id, status, subtotal, discount_amount, tax_amount, total_amount, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 0, 0, 0, 0, $6, $7) RETURNING id
      `, [qNum, customerId, salesRepId, priceListId, scenario.status, createdAt, createdAt]);
      
      const quotationId = qRes.rows[0].id;

      // Add Items
      let subtotal = 0;
      let totalDiscount = 0;
      let totalCost = 0;

      for (let j = 0; j < 3; j++) {
        const prod = products[j % products.length];
        const qty = Math.floor(Math.random() * 5) + 1;
        const lineTotal = prod.price * qty;
        const discAmt = (lineTotal * scenario.discount) / 100;
        const finalPrice = lineTotal - discAmt;
        const costPrice = (prod.cost_price || (prod.price * 0.6)) * qty;
        
        subtotal += lineTotal;
        totalDiscount += discAmt;
        totalCost += costPrice;

        await client.query(`
          INSERT INTO quotation_items (quotation_id, product_id, quantity, unit_price, discount_percent, discount_amount, line_total, original_price, final_price, cost_price, margin_amount, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [quotationId, prod.id, qty, prod.price, scenario.discount, discAmt, finalPrice, lineTotal, finalPrice, costPrice, finalPrice - costPrice, createdAt]);
      }

      const taxAmount = (subtotal - totalDiscount) * 0.1;
      const totalAmount = subtotal - totalDiscount + taxAmount;
      const totalMargin = (subtotal - totalDiscount) - totalCost;

      // Update Quotation totals
      await client.query(`
        UPDATE quotations 
        SET subtotal = $1, discount_amount = $2, tax_amount = $3, total_amount = $4, total_margin = $5
        WHERE id = $6
      `, [subtotal, totalDiscount, taxAmount, totalAmount, totalMargin, quotationId]);

      // Add Events
      const eventTypes = ['QUOTE_CREATED', 'QUOTE_SENT', 'CUSTOMER_VIEWED', 'COUNTER_OFFER', 'QUOTE_REVISED'];
      for (let k = 0; k < scenario.eventCount; k++) {
        await client.query(`
          INSERT INTO deal_events (quotation_id, event_type, actor_id, actor_type, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `, [quotationId, eventTypes[k % eventTypes.length], salesRepId, 'SALES_REP', new Date(Date.now() - (scenario.daysOld - k) * 24 * 60 * 60 * 1000).toISOString()]);
      }

      // Add Approval History
      if (scenario.approval) {
        const arRes = await client.query(`
          INSERT INTO approval_requests (quotation_id, requested_by, approval_level, status, requested_at)
          VALUES ($1, $2, 'MANAGER', $3, $4) RETURNING id
        `, [quotationId, salesRepId, scenario.approval, createdAt]);
        
        if (scenario.approval !== 'PENDING') {
          await client.query(`
            INSERT INTO approval_history (approval_request_id, action_by, action, reason, action_at)
            VALUES ($1, $2, $3, $4, $5)
          `, [arRes.rows[0].id, salesRepId, scenario.approval, 'Dummy auto action', createdAt]);
        }
      }

      console.log(`Created Deal: ${scenario.desc} (ID: ${quotationId})`);
    }

    await client.query('COMMIT');
    console.log('Successfully generated dummy deals!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating deals:', error);
  } finally {
    client.release();
    pool.end();
  }
};

generateDummyDeals();
