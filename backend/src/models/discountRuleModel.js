const { pool } = require('../config/db');

// In-memory matrix store for live customization if table is basic
let memoryGovernanceMatrix = null;

const getAllDiscountRules = async () => {
  const result = await pool.query(`
    SELECT
      dr.id,
      dr.tier_id,
      ct.name AS tier_name,
      dr.category_id,
      c.name AS category_name,
      dr.max_discount,
      dr.approval_level,
      dr.created_at,
      dr.updated_at
    FROM discount_rules dr
    JOIN customer_tiers ct
      ON dr.tier_id = ct.id
    JOIN categories c
      ON dr.category_id = c.id
    ORDER BY ct.name ASC, c.name ASC
  `);

  return result.rows;
};

const getDiscountRule = async (tierId, categoryId) => {
  const result = await pool.query(`
    SELECT
      dr.id,
      dr.tier_id,
      ct.name AS tier_name,
      dr.category_id,
      c.name AS category_name,
      dr.max_discount,
      dr.approval_level
    FROM discount_rules dr
    JOIN customer_tiers ct
      ON dr.tier_id = ct.id
    JOIN categories c
      ON dr.category_id = c.id
    WHERE dr.tier_id = $1
      AND dr.category_id = $2
  `, [tierId, categoryId]);

  return result.rows[0] || null;
};

const getGovernanceMatrix = async () => {
  if (memoryGovernanceMatrix) {
    return memoryGovernanceMatrix;
  }

  const defaultMatrix = {
    version: 'v4.8.2',
    status: 'Live in Production',
    matrixCode: 'AUTH-502',
    tiers: [
      {
        id: 'DISC-TIER-01',
        name: 'Standard',
        min_discount: 0.0,
        max_discount: 5.0,
        auto_approval: true,
        approval_required: false,
        max_approver_level: '—',
        status: 'Active',
        margin_floor: 30.0,
        applies_to: 'All Accounts'
      },
      {
        id: 'DISC-TIER-02',
        name: 'Sales Manager',
        min_discount: 5.1,
        max_discount: 10.0,
        auto_approval: false,
        approval_required: true,
        max_approver_level: 'Sales Manager',
        status: 'Active',
        margin_floor: 20.0,
        applies_to: 'All Accounts'
      },
      {
        id: 'DISC-TIER-03',
        name: 'Regional Manager',
        min_discount: 10.1,
        max_discount: 15.0,
        auto_approval: false,
        approval_required: true,
        max_approver_level: 'Regional Sales Mgr',
        status: 'Active',
        margin_floor: 15.0,
        applies_to: 'All Enterprise & Mid-Market Accounts'
      },
      {
        id: 'DISC-TIER-04',
        name: 'Finance Review',
        min_discount: 15.1,
        max_discount: 20.0,
        auto_approval: false,
        approval_required: true,
        max_approver_level: 'Finance Director',
        status: 'Active',
        margin_floor: 10.0,
        applies_to: 'All Enterprise & Mid-Market Accounts'
      },
      {
        id: 'DISC-TIER-05',
        name: 'Executive Approval',
        min_discount: 20.1,
        max_discount: 100.0,
        auto_approval: false,
        approval_required: true,
        max_approver_level: 'VP / Executive Committee',
        status: 'Active',
        margin_floor: 5.0,
        applies_to: 'Strategic Key Accounts'
      }
    ],
    chainSteps: [
      {
        step: 1,
        title: 'Sales Manager',
        trigger: 'Discount > 5.0%',
        assigned: 'Direct Sales Team Leads',
        sla: 'Escalate after 12 Hours'
      },
      {
        step: 2,
        title: 'Regional Sales Manager',
        trigger: 'Discount > 10.0% or Value > ₹5,00,000',
        assigned: 'Regional Sales Leadership (Tier-2)',
        sla: 'Escalate after 24 Hours'
      },
      {
        step: 3,
        title: 'Finance Review',
        trigger: 'Discount > 15.0% or Margin < 25.0%',
        assigned: 'Commercial Finance Desk',
        sla: 'Escalate after 24 Hours'
      },
      {
        step: 4,
        title: 'Executive Committee Sign-Off',
        trigger: 'Discount > 20.0% or Value > ₹10,00,000',
        assigned: 'VP Sales / CFO',
        sla: 'Escalate after 48 Hours'
      }
    ],
    policyTriggers: {
      require_limit_approval: true,
      require_margin_approval: true,
      require_high_value_approval: true,
      allow_rep_override: false,
      margin_threshold: 25.0,
      high_value_threshold: 1000000
    },
    auditLog: [
      { id: 1, author: 'Alex Vance', time: 'Today - 10:42 AM', desc: 'Regional Manager discount limit updated from 12% to 15%' },
      { id: 2, author: 'System Admin', time: 'Yesterday - 03:10 PM', desc: 'Finance approval stop SLA reduced to 24h' },
      { id: 3, author: 'Governance Committee', time: '12 Oct 2026', desc: 'Executive Approval threshold aligned to ₹10,00,000' },
      { id: 4, author: 'Policy Admin', time: '10 Oct 2026', desc: 'Policy compliance rule #DISC-101 published' }
    ]
  };

  memoryGovernanceMatrix = defaultMatrix;
  return defaultMatrix;
};

const saveGovernanceMatrix = async (matrixData) => {
  memoryGovernanceMatrix = {
    ...matrixData,
    auditLog: [
      {
        id: Date.now(),
        author: 'Alex Vance',
        time: 'Just now',
        desc: `Policy matrix updated to ${matrixData.version || 'v4.8.2'} (${matrixData.tiers?.length || 5} active tiers configured)`
      },
      ...(matrixData.auditLog || [])
    ]
  };
  return memoryGovernanceMatrix;
};

module.exports = {
  getAllDiscountRules,
  getDiscountRule,
  getGovernanceMatrix,
  saveGovernanceMatrix
};
