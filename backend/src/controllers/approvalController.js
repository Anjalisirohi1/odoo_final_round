const approvalService = require("../services/approvalService");

/*
|--------------------------------------------------------------------------
| GET /api/approvals/pending
|--------------------------------------------------------------------------
*/

async function getPendingApprovals(req, res) {
    try {
        const data = await approvalService.getPendingApprovals(req.user.id);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get pending approvals error:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}

/*
|--------------------------------------------------------------------------
| GET /api/approvals/:id
|--------------------------------------------------------------------------
*/

async function getApprovalDetails(req, res) {
    try {
        const { id } = req.params;
        const data = await approvalService.getApprovalDetails(id, req.user.id);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get approval details error:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}

/*
|--------------------------------------------------------------------------
| POST /api/approvals/:id/action
|--------------------------------------------------------------------------
*/

async function takeApprovalAction(req, res) {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;

        if (!action) {
            return res.status(400).json({
                success: false,
                message: "Action is required."
            });
        }

        const data = await approvalService.takeApprovalAction(
            id,
            req.user.id,
            action,
            reason
        );

        res.status(200).json({
            success: true,
            message:
                data.status === "PENDING_APPROVAL"
                    ? "Manager approval completed. Finance approval is now required."
                    : `Approval action ${action} completed.`,
            data
        });

    } catch (error) {
        console.error("Approval action error:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getPendingApprovals,
    getApprovalDetails,
    takeApprovalAction
};
