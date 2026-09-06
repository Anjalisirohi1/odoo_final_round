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

async function getFulfillmentDetails(req, res) {
    try {
        const data = await service.getFulfillmentById(req.params.id);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get fulfillment details error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch fulfillment details"
        });
    }
}

async function updateStatus(req, res) {
    try {
        const { status, notes } = req.body;
        const userId = req.user ? req.user.id : null;
        const data = await service.updateFulfillmentStatus(req.params.id, status, notes, userId);
        res.status(200).json({
            success: true,
            message: `Fulfillment status updated to ${status}`,
            data
        });
    } catch (error) {
        console.error("Update fulfillment status error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update fulfillment status"
        });
    }
}

async function shipFulfillment(req, res) {
    try {
        const { carrier, trackingNumber } = req.body;
        const userId = req.user ? req.user.id : null;
        const data = await service.shipFulfillment(req.params.id, carrier, trackingNumber, userId);
        res.status(200).json({
            success: true,
            message: "Fulfillment marked as shipped and in-transit",
            data
        });
    } catch (error) {
        console.error("Ship fulfillment error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to ship fulfillment"
        });
    }
}

async function getSplitSuggestion(req, res) {
    try {
        const data = await service.getSplitSuggestion(req.params.id);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function acceptSplit(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        const data = await service.acceptSplit(req.params.id, userId);
        res.status(200).json({ success: true, message: "Warehouse split accepted", data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function consolidateBackorder(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        const data = await service.consolidateBackorder(req.params.id, userId);
        res.status(200).json({ success: true, message: "Backorder consolidated", data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    getDashboard,
    createFulfillment,
    getFulfillmentDetails,
    updateStatus,
    shipFulfillment,
    getSplitSuggestion,
    acceptSplit,
    consolidateBackorder
};
