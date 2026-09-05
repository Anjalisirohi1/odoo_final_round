const express =
    require("express");

const router =
    express.Router();


const {
    protect,
    authorize
} =
    require(
        "../middleware/authMiddleware"
    );


const {

    analyzeDeal,

    getDashboard,

    getDealDetails

} =
    require(
        "../controllers/dealHealthController"
    );


/* =====================================================
   DASHBOARD

   ZERO ML CALLS
===================================================== */

router.get(
    "/dashboard",

    protect,

    authorize(
        "ADMIN",
        "SALES_MANAGER",
        "SALES_REP"
    ),

    getDashboard
);


/* =====================================================
   ANALYZE ONE QUOTATION

   THIS CALLS ML
===================================================== */

router.post(
    "/analyze/:quotationId",

    protect,

    authorize(
        "ADMIN",
        "SALES_MANAGER",
        "SALES_REP"
    ),

    analyzeDeal
);


/* =====================================================
   ONE DEAL
===================================================== */

router.get(
    "/deals/:quotationId",

    protect,

    authorize(
        "ADMIN",
        "SALES_MANAGER",
        "SALES_REP"
    ),

    getDealDetails
);


module.exports =
    router;
