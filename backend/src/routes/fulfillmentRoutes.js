const express = require("express");
const router = express.Router();
const { optionalProtect } = require("../middleware/authMiddleware");
const controller = require("../controllers/fulfillmentController");

router.get("/", optionalProtect, controller.getDashboard);
router.get("/:id", optionalProtect, controller.getFulfillmentDetails);
router.post("/", optionalProtect, controller.createFulfillment);
router.post("/:id/status", optionalProtect, controller.updateStatus);
router.patch("/:id/status", optionalProtect, controller.updateStatus);
router.post("/:id/ship", optionalProtect, controller.shipFulfillment);
router.get("/:id/split-suggestion", optionalProtect, controller.getSplitSuggestion);
router.post("/:id/accept-split", optionalProtect, controller.acceptSplit);
router.post("/:id/consolidate-backorder", optionalProtect, controller.consolidateBackorder);

module.exports = router;
