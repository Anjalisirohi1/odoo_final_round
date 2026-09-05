const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const controller = require("../controllers/approvalController");

/*
|--------------------------------------------------------------------------
| Approval Queue
|--------------------------------------------------------------------------
| Manager + Finance only
|--------------------------------------------------------------------------
*/
router.get(
    "/pending",
    protect,
    authorize("SALES_MANAGER", "FINANCE"),
    controller.getPendingApprovals
);

/*
|--------------------------------------------------------------------------
| Approval Details
|--------------------------------------------------------------------------
| Manager + Finance only
|--------------------------------------------------------------------------
*/
router.get(
    "/:id",
    protect,
    authorize("SALES_MANAGER", "FINANCE"),
    controller.getApprovalDetails
);

/*
|--------------------------------------------------------------------------
| Approval Action
|--------------------------------------------------------------------------
| Manager + Finance only
|--------------------------------------------------------------------------
*/
router.post(
    "/:id/action",
    protect,
    authorize("SALES_MANAGER", "FINANCE"),
    controller.takeApprovalAction
);

module.exports = router;
