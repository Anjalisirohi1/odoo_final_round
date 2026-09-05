const { pool } = require('../config/db');

const createApprovalRequest = async (quotationId, requestedBy, assignedTo, approvalLevel, reason, client = pool) => {
  const result = await client.query(`
    INSERT INTO approval_requests (
      quotation_id,
      requested_by,
      assigned_to,
      approval_level,
      status,
      reason
    ) VALUES ($1, $2, $3, $4, 'PENDING', $5)
    RETURNING *
  `, [quotationId, requestedBy, assignedTo, approvalLevel, reason]);
  return result.rows[0];
};

const handleApprovalAction = async (approvalId, action, reason, actionBy) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get the approval request
    const approvalResult = await client.query(`
      SELECT * FROM approval_requests WHERE id = $1
    `, [approvalId]);

    if (approvalResult.rows.length === 0) {
      throw new Error('Approval request not found');
    }

    const approval = approvalResult.rows[0];
    if (approval.status !== 'PENDING') {
      throw new Error('Approval request is not pending');
    }

    // 2. Update the approval request
    const updatedApproval = await client.query(`
      UPDATE approval_requests
      SET status = $1, resolved_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [action, approvalId]);

    // 3. Create approval history record
    await client.query(`
      INSERT INTO approval_history (
        approval_request_id,
        action_by,
        action,
        reason
      ) VALUES ($1, $2, $3, $4)
    `, [approvalId, actionBy, action, reason]);

    // 4. Update the quotation status
    let quotationStatus = 'PENDING_APPROVAL';
    if (action === 'APPROVED') {
      quotationStatus = 'APPROVED';
    } else if (action === 'REJECTED') {
      quotationStatus = 'REJECTED';
    } else if (action === 'RETURNED') {
      quotationStatus = 'DRAFT'; // or a separate RETURNED state
    }

    await client.query(`
      UPDATE quotations
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [quotationStatus, approval.quotation_id]);

    // 5. Create audit log
    await client.query(`
      INSERT INTO audit_logs (
        user_id,
        entity_type,
        entity_id,
        action,
        reason,
        old_value,
        new_value
      ) VALUES ($1, 'QUOTATION', $2, $3, $4, $5, $6)
    `, [
      actionBy, 
      approval.quotation_id, 
      'APPROVAL_ACTION', 
      reason,
      JSON.stringify({ status: 'PENDING_APPROVAL' }),
      JSON.stringify({ status: quotationStatus })
    ]);

    await client.query('COMMIT');
    return updatedApproval.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getPendingApprovals = async (roleName) => {
  // roleName could be used to filter by MANAGER vs FINANCE
  // For now we just return all PENDING or filter based on role logic
  let levelFilter = '';
  if (roleName === 'MANAGER') {
    // Manager sees MANAGER and MANAGER_AND_FINANCE
    levelFilter = "AND approval_level IN ('MANAGER', 'MANAGER_AND_FINANCE')";
  } else if (roleName === 'FINANCE') {
    // Finance sees FINANCE and MANAGER_AND_FINANCE
    levelFilter = "AND approval_level IN ('FINANCE', 'MANAGER_AND_FINANCE')";
  }

  const result = await pool.query(`
    SELECT 
      ar.id,
      ar.quotation_id,
      ar.approval_level,
      ar.status,
      ar.reason,
      ar.requested_at,
      q.quotation_number,
      q.total_amount,
      c.name as customer_name,
      u.name as requested_by_name
    FROM approval_requests ar
    JOIN quotations q ON ar.quotation_id = q.id
    JOIN customers c ON q.customer_id = c.id
    JOIN users u ON ar.requested_by = u.id
    WHERE ar.status = 'PENDING'
    ${levelFilter}
    ORDER BY ar.requested_at DESC
  `);
  
  return result.rows;
};

module.exports = {
  createApprovalRequest,
  handleApprovalAction,
  getPendingApprovals
};
