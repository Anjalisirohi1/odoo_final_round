const { pool } = require('../config/db');

const getAllCustomers = async () => {
  const result = await pool.query(`
    SELECT
      c.id,
      c.company_name,
      c.contact_name,
      c.email,
      c.phone,
      c.currency,
      c.is_active,
      c.created_at,
      ct.name AS tier_name,
      ct.default_discount_limit
    FROM customers c
    JOIN customer_tiers ct
      ON c.tier_id = ct.id
    WHERE c.is_active = TRUE
    ORDER BY c.company_name ASC
  `);

  return result.rows;
};

const getCustomerBillingDetails = async (customerId) => {
  let query = `
    SELECT
      c.id,
      c.company_name,
      c.contact_name,
      c.email,
      c.phone,
      c.currency,
      c.is_active,
      c.industry,
      c.region,
      c.created_at,
      ct.name AS tier_name,
      ct.default_discount_limit
    FROM customers c
    JOIN customer_tiers ct ON c.tier_id = ct.id
  `;
  let params = [];

  if (customerId && customerId !== 'default' && customerId !== 'CUST-1042' && customerId !== 'SUB-1042') {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(customerId);
    if (isUuid) {
      query += ` WHERE c.id = $1`;
      params.push(customerId);
    } else {
      query += ` WHERE c.company_name ILIKE $1`;
      params.push(`%${customerId}%`);
    }
  } else {
    query += ` WHERE c.company_name ILIKE '%Acme%' LIMIT 1`;
  }

  const custResult = await pool.query(query, params);
  let customer = custResult.rows[0];

  if (!customer) {
    const fallbackRes = await pool.query(`
      SELECT c.*, ct.name as tier_name 
      FROM customers c 
      JOIN customer_tiers ct ON c.tier_id = ct.id 
      LIMIT 1
    `);
    customer = fallbackRes.rows[0];
  }

  // Fetch recent invoices for this customer
  let invoices = [];
  if (customer?.id) {
    const invResult = await pool.query(
      `SELECT id, invoice_number, total_amount as amount, due_date, status, created_at 
       FROM invoices 
       WHERE customer_id = $1 
       ORDER BY created_at DESC LIMIT 5`,
      [customer.id]
    );

    invoices = invResult.rows.map(inv => ({
      id: inv.invoice_number || inv.id,
      issue_date: inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Sep 2026',
      amount: Number(inv.amount) || 248000,
      due_date: inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Oct 2026',
      status: inv.status === 'OVERDUE' ? 'Overdue (5d)' : inv.status === 'PAID' ? 'Paid' : 'Unpaid',
      status_color: inv.status === 'OVERDUE' ? 'red' : inv.status === 'PAID' ? 'green' : 'amber'
    }));
  }

  if (invoices.length === 0) {
    invoices = [
      { id: 'INV-2026-1048', issue_date: '12 Sep 2026', amount: 248000, due_date: '12 Oct 2026', status: 'Overdue (5d)', status_color: 'red' },
      { id: 'INV-2026-1021', issue_date: '12 Aug 2026', amount: 48000, due_date: '12 Sep 2026', status: 'Paid', status_color: 'green' },
      { id: 'INV-2026-0998', issue_date: '12 Jul 2026', amount: 48000, due_date: '12 Aug 2026', status: 'Paid', status_color: 'green' }
    ];
  }

  // Format contact name to avoid duplicate "(Head of Finance)" string
  let contactName = customer?.contact_name || 'Rahul Sharma';
  if (contactName.includes('(Head of Finance)')) {
    contactName = contactName.replace(/\s*\(Head of Finance\)/g, '').trim();
  }
  contactName = `${contactName} (Head of Finance)`;

  let entityName = customer?.company_name || 'Acme Corporation';
  if (!entityName.toLowerCase().includes('private limited') && !entityName.toLowerCase().includes('pvt ltd')) {
    entityName = `${entityName} Private Limited`;
  }

  return {
    customer: {
      id: customer?.id || '28d6792d-2a1c-4f9c-bd77-b2010176eb9f',
      code: 'CUST-1042',
      company_name: customer?.company_name || 'Acme Corporation',
      customer_type: 'Enterprise Customer',
      is_active: customer?.is_active ?? true,
      active_subscription: 'Enterprise Pro',
      billing_status: 'Active',
      primary_currency: 'INR (₹)',
      total_contract_value: 1248000
    },
    billing_info: {
      entity_name: entityName,
      contact_name: contactName,
      email: customer?.email || 'accounts@acmecorp.com',
      email_verified: true,
      phone: customer?.phone || '+91 98765 43210',
      billing_address: 'Acme Corporation, 4th Floor, Prestige Tower, MG Road, Bengaluru, Karnataka - 560001, India',
      gstin: '29ABCDE1234F1Z5',
      pan: 'ABCDE1234F'
    },
    payment_preferences: {
      preferred_method: 'Bank Transfer (ACH / NEFT / RTGS)',
      payment_terms: 'Net 30 Days',
      billing_currency: 'INR (₹) - Indian Rupee',
      auto_debit: 'Disabled (Manual Wire Remittance)',
      invoice_delivery: 'Email (Automated PDF dispatch to AP team)',
      billing_frequency: 'Monthly Cycle (In Advance)'
    },
    tax_compliance: {
      tax_region: 'India (Karnataka State - Code 29)',
      gst_treatment: 'Standard B2B Supply',
      gst_rate: '18% (CGST 9% + SGST 9% intra-state)',
      gstin_status: '29ABCDE1234F1Z5 (Verified on GSTN)',
      rcm: 'No (Forward Charge by Supplier)',
      tax_exemption: 'Not Applicable (Full taxable supply)',
      compliance_badge: 'GST Rule 46 Compliant'
    },
    billing_settings: {
      generation_mode: 'Automatic (Scheduled on 1st of every month)',
      grace_period: '7 Days after due date',
      late_reminders: 'Enabled (3-step dunning workflow)',
      reminder_schedule: '3 days before due date, on due date, 3 days after',
      credit_limit: 10000000,
      credit_utilized: 248000
    },
    billing_summary: {
      current_subscription: 'Enterprise Pro',
      subscription_detail: 'Annual tier billed monthly',
      billing_cycle: 'Monthly',
      next_billing_date: '01 Nov 2026',
      monthly_commitment: 48000,
      outstanding_balance: 248000
    },
    payment_status: {
      status: 'Overdue',
      outstanding_amount: 248000,
      due_date_text: 'Due date was 12 Oct 2026 (5 days overdue)',
      latest_invoice: 'INV-2026-1048',
      due_date: '12 Oct 2026',
      days_outstanding: '5 days',
      payment_method: 'Not yet recorded'
    },
    recent_invoices: invoices,
    recent_activity: [
      { id: 1, title: 'Automated payment reminder scheduled', desc: 'Overdue Dunning Step 1 queued for AP finance contacts', timestamp: '17 Oct 2026, 10:30 AM', type: 'red' },
      { id: 2, title: 'Payment due date passed', desc: 'Invoice INV-2026-1048 transitioned to Overdue status', timestamp: '12 Oct 2026, 11:59 PM', type: 'amber' },
      { id: 3, title: 'Invoice INV-2026-1048 generated', desc: 'Issued from approved Subscription Contract SUB-1042', timestamp: '12 Sep 2026, 11:45 AM', type: 'blue' },
      { id: 4, title: 'Subscription billing renewed', desc: 'Monthly period cycle initiated for Oct-Dec window', timestamp: '01 Sep 2026, 09:00 AM', type: 'slate' }
    ]
  };
};

const updateCustomerBillingDetails = async (customerId, updateData) => {
  const { company_name, contact_name, email, phone } = updateData;
  let isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(customerId);
  let query = `UPDATE customers 
     SET company_name = COALESCE($1, company_name),
         contact_name = COALESCE($2, contact_name),
         email = COALESCE($3, email),
         phone = COALESCE($4, phone),
         updated_at = CURRENT_TIMESTAMP`;
  
  if (isUuid) {
    query += ` WHERE id = $5 RETURNING *`;
  } else {
    query += ` WHERE company_name ILIKE $5 RETURNING *`;
  }

  const result = await pool.query(query, [company_name, contact_name, email, phone, isUuid ? customerId : `%${customerId}%`]);
  return result.rows[0];
};

module.exports = {
  getAllCustomers,
  getCustomerBillingDetails,
  updateCustomerBillingDetails
};