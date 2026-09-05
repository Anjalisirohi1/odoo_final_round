require("dotenv").config();

const { buildDealContext } = require("./dealContextService");

const getMLApiUrl = () => {
    const url = process.env.ML_API_URL;
    if (!url) {
        throw new Error("ML_API_URL is missing from .env");
    }
    return url;
};


const callMLApi = async (endpoint, body) => {

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 90000); // 90s — Render free tier cold starts take ~60s

    try {

        const response = await fetch(
            `${getMLApiUrl()}${endpoint}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(body),

                signal: controller.signal
            }
        );


        let data;

        try {
            data = await response.json();
        } catch {
            data = {};
        }


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                data?.message ||
                `ML API failed with status ${response.status}`
            );
        }


        return data;

    } catch (error) {

        if (error.name === "AbortError") {
            throw new Error(
                `ML API timeout for ${endpoint}`
            );
        }

        throw error;

    } finally {

        clearTimeout(timeout);
    }
};


/* ---------------- DEAL HEALTH ---------------- */

const analyzeDealHealth = async (quotationId, context) => {

    return callMLApi(
        "/api/v1/deal-health/analyze",
        {
            quotation_id: quotationId,
            ...(context || {})
        }
    );
};


/* ---------------- PREDICTION ---------------- */

const predictDeal = async (quotationId, context) => {

    return callMLApi(
        "/api/v1/predictions/deal",
        {
            quotation_id: quotationId,
            ...(context || {})
        }
    );
};


/* ---------------- ANOMALY ---------------- */

const detectAnomaly = async (quotationId, context) => {

    return callMLApi(
        "/api/v1/anomalies/quotation",
        {
            quotation_id: quotationId,
            ...(context || {})
        }
    );
};


/* ---------------- INTELLIGENCE ---------------- */

const analyzeIntelligence = async (quotationId, context) => {

    return callMLApi(
        "/api/v1/deal-intelligence/analyze",
        {
            quotation_id: quotationId,

            include: [
                "RECOMMENDATION",
                "ANOMALY_DETECTION",
                "DEAL_HEALTH",
                "PREDICTION"
            ],

            ...(context || {})
        }
    );
};


/* ---------------- XAI ---------------- */

const explainDeal = async (quotationId) => {

    return callMLApi(
        "/api/v1/explanations/deal",
        {
            quotation_id: quotationId
        }
    );
};


/* ---------------- RECOMMENDATIONS ---------------- */

const getRecommendations = async (
    customerId,
    productIds,
    limit = 3
) => {

    return callMLApi(
        "/api/v1/recommendations/",
        {
            customer_id: customerId,
            product_ids: productIds,
            limit
        }
    );
};


module.exports = {

    analyzeDealHealth,

    predictDeal,

    detectAnomaly,

    analyzeIntelligence,

    explainDeal,

    getRecommendations
};
