const express = require("express");

const router = express.Router();

const {
    protect,
    optionalProtect,
    authorize
} = require("../middleware/authMiddleware");

const controller = require("../controllers/negotiationController");

router.post(
    "/",
    optionalProtect,
    controller.createNegotiation
);


router.get(
    "/my",
    protect,
    authorize("CUSTOMER"),
    controller.getMyNegotiations
);


/*
|--------------------------------------------------------------------------
| SALES TEAM
|--------------------------------------------------------------------------
*/

router.get(
    "/pending",
    protect,
    authorize(
        "SALES_REP",
        "SALES_MANAGER",
        "ADMIN"
    ),
    controller.getPending
);


/*
|--------------------------------------------------------------------------
| IMPORTANT
| /pending must appear BEFORE /:id
|--------------------------------------------------------------------------
*/

router.get(
    "/:id",
    protect,
    authorize(
        "CUSTOMER",
        "SALES_REP",
        "SALES_MANAGER",
        "ADMIN"
    ),
    controller.getDetails
);


router.post(
    "/:id/respond",
    protect,
    authorize(
        "SALES_REP",
        "SALES_MANAGER",
        "ADMIN"
    ),
    controller.respond
);


module.exports = router;
