const dealHealthService =
    require("../services/dealHealthService");


/* =====================================================
   ANALYZE ONE DEAL
===================================================== */

const analyzeDeal = async (req, res) => {

    try {

        const { quotationId } =
            req.params;


        const result =
            await dealHealthService
                .analyzeDeal(
                    quotationId
                );


        res.status(200).json({

            success: true,

            message:
                "Deal analysis completed successfully",

            data:
                result
        });


    } catch (error) {

        console.error(
            "Analyze Deal Error:",
            error
        );


        res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Failed to analyze deal"
        });
    }
};


/* =====================================================
   DASHBOARD
===================================================== */

const getDashboard =
    async (req, res) => {

        try {

            const result =
                await dealHealthService
                    .getDashboard();


            res.status(200).json({

                success: true,

                data:
                    result
            });


        } catch (error) {

            console.error(
                "Dashboard Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Failed to load dashboard"
            });
        }
    };


/* =====================================================
   DEAL DETAILS
===================================================== */

const getDealDetails =
    async (req, res) => {

        try {

            const { quotationId } =
                req.params;


            const result =
                await dealHealthService
                    .getDealDetails(
                        quotationId
                    );


            res.status(200).json({

                success: true,

                data:
                    result
            });


        } catch (error) {

            console.error(
                "Deal Detail Error:",
                error
            );


            res.status(
                error.statusCode || 500
            ).json({

                success: false,

                message:
                    error.message ||
                    "Failed to load deal"
            });
        }
    };


module.exports = {

    analyzeDeal,

    getDashboard,

    getDealDetails
};
