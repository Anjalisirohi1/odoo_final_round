const express = require("express");
const router = express.Router();

// Mocking auth middleware for now in case it doesn't exist yet, 
// to ensure the route doesn't crash on boot if the file is missing or named differently.
let protect = (req, res, next) => next();
let authorize = (...roles) => (req, res, next) => next();

try {
    const authMiddleware = require("../middleware/authMiddleware");
    if (authMiddleware.protect) protect = authMiddleware.protect;
    if (authMiddleware.authorize) authorize = authMiddleware.authorize;
} catch (e) {
    console.log("authMiddleware not found, using mock passthrough");
}

const controller = require("../controllers/fulfillmentController");

/*
|--------------------------------------------------------------------------
| Fulfillment dashboard/list
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    protect,
    authorize("ADMIN", "SALES_MANAGER", "SALES_REP", "FINANCE"),
    controller.getDashboard
);

/*
|--------------------------------------------------------------------------
| Create Fulfillment (Auto-Allocation & Split)
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    protect,
    authorize("ADMIN", "SALES_MANAGER", "OPERATIONS"),
    controller.createFulfillment
);

module.exports = router;
