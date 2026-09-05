const service = require("../services/negotiationService");


/*
|--------------------------------------------------------------------------
| CUSTOMER
| POST /api/negotiations
|--------------------------------------------------------------------------
*/

async function createNegotiation(req, res) {
    try {
        const {
            quotationId,
            message,
            requestedDeliveryDate,
            items = []
        } = req.body;

        if (!quotationId) {
            return res.status(400).json({
                success: false,
                message: "quotationId is required."
            });
        }

        const data = await service.createNegotiation(
            req.user,
            quotationId,
            message,
            requestedDeliveryDate,
            items
        );

        res.status(201).json({
            success: true,
            message: "Negotiation request submitted successfully.",
            data
        });

    } catch (error) {
        console.error("Create negotiation:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}


/*
|--------------------------------------------------------------------------
| CUSTOMER
| GET /api/negotiations/my
|--------------------------------------------------------------------------
*/

async function getMyNegotiations(req, res) {
    try {
        const data = await service.getMyNegotiations(req.user);

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}


/*
|--------------------------------------------------------------------------
| DETAILS
| GET /api/negotiations/:id
|--------------------------------------------------------------------------
*/

async function getDetails(req, res) {
    try {
        const data = await service.getDetails(
            req.params.id,
            req.user
        );

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}


/*
|--------------------------------------------------------------------------
| SALES
| GET /api/negotiations/pending
|--------------------------------------------------------------------------
*/

async function getPending(req, res) {
    try {
        const data = await service.getPendingNegotiations();

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}


/*
|--------------------------------------------------------------------------
| SALES
| POST /api/negotiations/:id/respond
|--------------------------------------------------------------------------
*/

async function respond(req, res) {
    try {
        const { action, message } = req.body;

        if (!action) {
            return res.status(400).json({
                success: false,
                message: "action is required."
            });
        }

        const data = await service.respond(
            req.params.id,
            req.user.id,
            action,
            message
        );

        res.status(200).json({
            success: true,
            message: `Negotiation ${action.toLowerCase()} successfully.`,
            data
        });

    } catch (error) {
        console.error("Negotiation response:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}


module.exports = {
    createNegotiation,
    getMyNegotiations,
    getDetails,
    getPending,
    respond
};
