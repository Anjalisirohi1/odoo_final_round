const dealHealthModel =
    require("../models/dealHealthModel");

const mlService =
    require("./mlService");

const { buildDealContext } =
    require("./dealContextService");


/* =====================================================
   ANALYZE ONE DEAL
===================================================== */

const analyzeDeal = async (quotationId) => {

    /*
     * 1. Make sure quotation exists.
     */

    const quotation =
        await dealHealthModel
            .getQuotationById(quotationId);


    if (!quotation) {

        const error =
            new Error("Quotation not found");

        error.statusCode = 404;

        throw error;
    }


    /*
     * 2. Build full deal context (single DB round-trip bundle).
     *    This context is sent to every ML endpoint so the model
     *    has real quotation/customer/product/event data to work with.
     */

    const context = await buildDealContext(quotationId);


    /*
     * 3. Run ML engines concurrently with full context.
     *    Use allSettled so partial failures don't block everything.
     */

    const { scoreDealLocally } = require('./localScoring');
    const localScores = scoreDealLocally(context);

    const fallbackHealth = localScores.health;
    const fallbackPrediction = localScores.prediction;
    const fallbackAnomaly = localScores.anomaly;
    const fallbackIntelligence = localScores.intelligence;

    const results = await Promise.allSettled([

        mlService
            .analyzeDealHealth(quotationId, context),

        mlService
            .predictDeal(quotationId, context),

        mlService
            .detectAnomaly(quotationId, context),

        mlService
            .analyzeIntelligence(quotationId, context)
    ]);

    const health       = results[0].status === 'fulfilled' ? results[0].value : fallbackHealth;
    const prediction   = results[1].status === 'fulfilled' ? results[1].value : fallbackPrediction;
    const anomaly      = results[2].status === 'fulfilled' ? results[2].value : fallbackAnomaly;
    const intelligence = results[3].status === 'fulfilled' ? results[3].value : fallbackIntelligence;

    if (results[0].status === 'rejected') {
        console.warn(`ML health failed for ${quotationId}: ${results[0].reason?.message || results[0].reason}`);
        console.log(`Using local intelligent scoring fallback for ${quotationId}`);
    }


    /*
     * 3. Save snapshot.
     */

    const savedAnalysis =
        await dealHealthModel.saveAnalysis({

            quotationId,

            health,

            prediction,

            anomaly,

            intelligence
        });


    return {

        quotation: {
            id: quotation.id,

            quotationNumber:
                quotation.quotation_number,

            customer:
                quotation.customer_name,

            value:
                Number(
                    quotation.total_amount
                ),

            status:
                quotation.status
        },

        analysis:
            savedAnalysis
    };
};


/* =====================================================
   DASHBOARD
   IMPORTANT: ZERO ML CALLS HERE
===================================================== */

const getDashboard = async () => {

    /*
     * PostgreSQL only.
     */

    const deals =
        await dealHealthModel
            .getLatestDealHealth();


    if (!deals.length) {

        return emptyDashboard();
    }


    /*
     * Only deals that have been analyzed.
     */

    const analyzedDeals =
        deals.filter(
            deal => deal.analysis_id
        );


    const pendingAnalysis =
        deals.filter(
            deal => !deal.analysis_id
        );


    if (!analyzedDeals.length) {

        return {
            ...emptyDashboard(),

            activeDeals: deals.map(deal => ({
                quotationId: deal.quotation_id,
                quotationNumber: deal.quotation_number,
                customer: deal.customer_name,
                value: Number(deal.total_amount || 0),
                status: deal.status,
                analysisStatus: "PENDING"
            })),

            metadata: {
                totalActiveDeals:
                    deals.length,

                analyzedDeals: 0,

                pendingAnalysis:
                    pendingAnalysis.length,

                generatedAt:
                    new Date().toISOString()
            }
        };
    }


    /* =================================================
       OVERALL HEALTH
    ================================================= */

    const overallHealth = average(
        analyzedDeals.map(
            deal =>
                Number(
                    deal.health_score || 0
                )
        )
    );


    /* =================================================
       PIPELINE WIN POTENTIAL

       Better than simple average:
       value-weighted probability.

       A ₹10 lakh deal should affect pipeline
       potential more than a ₹10,000 deal.
    ================================================= */

    let weightedProbability = 0;

    let totalPipelineValue = 0;


    analyzedDeals.forEach(deal => {

        const value =
            Number(
                deal.total_amount || 0
            );

        const probability =
            Number(
                deal.win_probability || 0
            );


        weightedProbability +=
            value * probability;

        totalPipelineValue +=
            value;
    });


    const pipelineWinPotential =
        totalPipelineValue > 0
            ? (
                weightedProbability /
                totalPipelineValue
            ) * 100
            : 0;


    /* =================================================
       DISTRIBUTION
    ================================================= */

    const distribution = {

        excellent: 0,
        healthy: 0,
        atRisk: 0,
        critical: 0
    };


    analyzedDeals.forEach(deal => {

        const score =
            Number(
                deal.health_score || 0
            );


        if (score >= 80) {

            distribution.excellent++;

        } else if (score >= 60) {

            distribution.healthy++;

        } else if (score >= 40) {

            distribution.atRisk++;

        } else {

            distribution.critical++;
        }
    });


    /* =================================================
       HIGH RISK
    ================================================= */

    const highRiskDeals =
        analyzedDeals.filter(deal => {

            const health =
                Number(
                    deal.health_score || 0
                );

            return (
                health < 40 ||
                deal.anomaly_risk === "HIGH" ||
                deal.anomaly_risk === "CRITICAL"
            );
        });


    const revenueAtRisk =
        highRiskDeals.reduce(
            (total, deal) =>
                total +
                Number(
                    deal.total_amount || 0
                ),
            0
        );


    /* =================================================
       SIGNAL COMPOSITION
    ================================================= */

    const signals = {

        conversionPotential:
            averagePercentage(
                analyzedDeals,
                "conversion_potential"
            ),

        engagementHealth:
            averagePercentage(
                analyzedDeals,
                "engagement_health"
            ),

        financialHealth:
            averagePercentage(
                analyzedDeals,
                "financial_health"
            ),

        dealMomentum:
            averagePercentage(
                analyzedDeals,
                "deal_momentum"
            ),

        riskSafetyIndex:
            averagePercentage(
                analyzedDeals,
                "risk_safety_index"
            )
    };


    /* =================================================
       AI ATTENTION REQUIRED
    ================================================= */

    const attentionRequired =
        analyzedDeals

            .filter(deal => {

                const score =
                    Number(
                        deal.health_score || 0
                    );

                return (
                    score < 60 ||
                    deal.anomaly_risk === "HIGH" ||
                    deal.anomaly_risk === "CRITICAL"
                );
            })

            .sort(
                (a, b) =>
                    Number(a.health_score) -
                    Number(b.health_score)
            )

            .slice(0, 10)

            .map(deal => ({

                quotationId:
                    deal.quotation_id,

                quotationNumber:
                    deal.quotation_number,

                customer:
                    deal.customer_name,

                value:
                    Number(
                        deal.total_amount
                    ),

                healthScore:
                    Number(
                        deal.health_score
                    ),

                classification:
                    deal.classification,

                anomalyRisk:
                    deal.anomaly_risk,

                concerns:
                    deal.concerns || [],

                anomalyReasons:
                    deal.anomaly_reasons || [],

                recommendedActions:
                    deal.recommended_actions || [],

                intelligence:
                    deal.intelligence || null
            }));


    /* =================================================
       ACTIVE DEAL TABLE
    ================================================= */

    const activeDeals =
        deals.map(deal => {

            /*
             * Quotation exists but hasn't
             * been ML analyzed yet.
             */

            if (!deal.analysis_id) {

                return {

                    quotationId:
                        deal.quotation_id,

                    quotationNumber:
                        deal.quotation_number,

                    customer:
                        deal.customer_name,

                    value:
                        Number(
                            deal.total_amount
                        ),

                    status:
                        deal.status,

                    analysisStatus:
                        "PENDING"
                };
            }


            return {

                quotationId:
                    deal.quotation_id,

                quotationNumber:
                    deal.quotation_number,

                customer:
                    deal.customer_name,

                salesRep:
                    deal.sales_rep_name,

                value:
                    Number(
                        deal.total_amount
                    ),

                status:
                    deal.status,

                health:
                    Number(
                        deal.health_score
                    ),

                classification:
                    deal.classification,

                winProbability:
                    Number(
                        (
                            Number(
                                deal.win_probability
                            ) * 100
                        ).toFixed(1)
                    ),

                expectedRevenue:
                    Number(
                        deal.expected_revenue || 0
                    ),

                anomalyRisk:
                    deal.anomaly_risk,

                anomalyScore:
                    Number(
                        deal.anomaly_score || 0
                    ),

                priority:
                    deal.priority_classification,

                aiAction:
                    deal
                        .recommended_actions
                        ?.[0]
                        ?.action_type
                        || "MONITOR",

                analyzedAt:
                    deal.analyzed_at,

                analysisStatus:
                    "READY",

                healthScore:
                    Number(deal.health_score),

                concerns:
                    deal.concerns || [],

                anomalyReasons:
                    deal.anomaly_reasons || [],

                recommendedActions:
                    deal.recommended_actions || [],

                intelligence:
                    deal.intelligence || null
            };
        });


    /* =================================================
       DISTRIBUTION PERCENTAGES
    ================================================= */

    const count =
        analyzedDeals.length;


    const distributionResponse = {

        excellent: distributionItem(
            distribution.excellent,
            count
        ),

        healthy: distributionItem(
            distribution.healthy,
            count
        ),

        atRisk: distributionItem(
            distribution.atRisk,
            count
        ),

        critical: distributionItem(
            distribution.critical,
            count
        )
    };


    /* =================================================
       RETURN
    ================================================= */

    return {

        summary: {

            overallHealth:
                round(overallHealth),

            pipelineWinPotential:
                round(
                    pipelineWinPotential
                ),

            highRiskDeals:
                highRiskDeals.length,

            revenueAtRisk:
                round(
                    revenueAtRisk
                )
        },


        distribution:
            distributionResponse,


        signals,


        attentionRequired,


        activeDeals,


        metadata: {

            totalActiveDeals:
                deals.length,

            analyzedDeals:
                analyzedDeals.length,

            pendingAnalysis:
                pendingAnalysis.length,

            generatedAt:
                new Date().toISOString()
        }
    };
};


/* =====================================================
   ONE DEAL DETAILS
===================================================== */

const getDealDetails =
    async (quotationId) => {

        const quotation =
            await dealHealthModel
                .getQuotationById(
                    quotationId
                );


        if (!quotation) {

            const error =
                new Error(
                    "Quotation not found"
                );

            error.statusCode = 404;

            throw error;
        }


        const analysis =
            await dealHealthModel
                .getLatestAnalysisByQuotationId(
                    quotationId
                );


        const history =
            await dealHealthModel
                .getAnalysisHistory(
                    quotationId
                );


        return {

            quotation,

            analysis,

            history
        };
    };


/* =====================================================
   HELPER FUNCTIONS
===================================================== */

const average = values => {

    if (!values.length) {
        return 0;
    }


    return (
        values.reduce(
            (sum, value) =>
                sum + Number(value || 0),
            0
        ) / values.length
    );
};


const averagePercentage =
    (deals, property) => {

        const values =
            deals.map(
                deal =>
                    Number(
                        deal[property] || 0
                    )
            );


        return round(
            average(values) * 100
        );
    };


const round = value =>
    Number(
        Number(value || 0)
            .toFixed(1)
    );


const distributionItem =
    (count, total) => ({

        count,

        percentage:
            total === 0
                ? 0
                : round(
                    (count / total) * 100
                )
    });


const emptyDashboard = () => ({

    summary: {

        overallHealth: 0,

        pipelineWinPotential: 0,

        highRiskDeals: 0,

        revenueAtRisk: 0
    },

    distribution: {

        excellent: {
            count: 0,
            percentage: 0
        },

        healthy: {
            count: 0,
            percentage: 0
        },

        atRisk: {
            count: 0,
            percentage: 0
        },

        critical: {
            count: 0,
            percentage: 0
        }
    },

    signals: {

        conversionPotential: 0,

        engagementHealth: 0,

        financialHealth: 0,

        dealMomentum: 0,

        riskSafetyIndex: 0
    },

    attentionRequired: [],

    activeDeals: []
});


module.exports = {

    analyzeDeal,

    getDashboard,

    getDealDetails
};
