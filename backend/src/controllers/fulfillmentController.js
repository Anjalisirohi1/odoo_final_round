const service = require("../services/fulfillmentService");

async function getDashboard(req, res) {
    try {
        const {
            search,
            status,
            warehouseId,
            fromDate,
            toDate,
            page = 1,
            limit = 10
        } = req.query;

        const data = await service.getDashboard({
            search,
            status,
            warehouseId,
            fromDate,
            toDate,
            page,
            limit
        });

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Fulfillment dashboard error:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}

async function createFulfillment(req, res) {
    try {
        const { quotation_id, customer_id, expected_delivery_date, notes } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!quotation_id || !customer_id) {
            return res.status(400).json({
                success: false,
                message: "quotation_id and customer_id are required"
            });
        }

        const data = await service.createFulfillmentTransaction({
            quotation_id, 
            customer_id, 
            expected_delivery_date, 
            notes
        }, userId);

        res.status(201).json({
            success: true,
            message: "Fulfillment created successfully",
            data
        });
    } catch (error) {
        console.error("Fulfillment creation error:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getDashboard,
    createFulfillment
};
