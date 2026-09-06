const { pool } = require("../config/db");


/* =====================================================
   CHECK QUOTATION
===================================================== */

const getQuotationById = async (quotationId) => {

    const result = await pool.query(
        `
        SELECT
            q.id,
            q.quotation_number,
            q.customer_id,
            c.company_name AS customer_name,

            q.sales_rep_id,
            u.name AS sales_rep_name,

            q.status,
            q.subtotal,
            q.discount_amount,
            q.tax_amount,
            q.total_amount,

            q.created_at,
            q.updated_at,
            q.valid_until

        FROM quotations q

        JOIN customers c
            ON c.id = q.customer_id

        JOIN users u
            ON u.id = q.sales_rep_id

        WHERE q.id = $1
        `,
        [quotationId]
    );

    return result.rows[0] || null;
};


/* =====================================================
   SAVE ML ANALYSIS
===================================================== */

const saveAnalysis = async ({
    quotationId,
    health,
    prediction,
    anomaly,
    intelligence
}) => {

    const query = `
        INSERT INTO deal_health_scores (

            quotation_id,

            health_score,
            classification,

            conversion_potential,
            engagement_health,
            financial_health,
            deal_momentum,
            risk_safety_index,

            win_probability,
            prediction_confidence,
            predicted_outcome,

            expected_revenue,
            priority_score,
            priority_classification,

            is_anomaly,
            anomaly_score,
            anomaly_risk,

            strengths,
            concerns,
            recommended_actions,

            anomaly_reasons,
            anomaly_deviations,

            intelligence,

            analyzed_at
        )

        VALUES (

            $1,

            $2,
            $3,

            $4,
            $5,
            $6,
            $7,
            $8,

            $9,
            $10,
            $11,

            $12,
            $13,
            $14,

            $15,
            $16,
            $17,

            $18::jsonb,
            $19::jsonb,
            $20::jsonb,

            $21::jsonb,
            $22::jsonb,

            $23::jsonb,

            CURRENT_TIMESTAMP
        )

        RETURNING *;
    `;


    const values = [

        quotationId,

        health?.health_score ?? null,
        health?.classification ?? null,

        health?.dimension_scores
            ?.conversion_potential ?? null,

        health?.dimension_scores
            ?.engagement ?? null,

        health?.dimension_scores
            ?.financial_health ?? null,

        health?.dimension_scores
            ?.momentum ?? null,

        health?.dimension_scores
            ?.risk_safety ?? null,


        prediction
            ?.win_probability ?? null,

        prediction
            ?.confidence?.score ?? null,

        prediction
            ?.predicted_outcome ?? null,

        prediction
            ?.revenue_forecast
            ?.expected_revenue ?? null,

        prediction
            ?.priority?.score ?? null,

        prediction
            ?.priority
            ?.classification ?? null,


        anomaly?.is_anomaly ?? false,

        anomaly?.anomaly_score ?? null,

        anomaly?.risk_level ?? null,


        JSON.stringify(
            health?.strengths || []
        ),

        JSON.stringify(
            health?.concerns || []
        ),

        JSON.stringify(
            health?.recommended_actions || []
        ),

        JSON.stringify(
            anomaly?.primary_reasons || []
        ),

        JSON.stringify(
            anomaly?.deviations || []
        ),

        JSON.stringify(
            intelligence || {}
        )
    ];


    const result =
        await pool.query(query, values);

    return result.rows[0];
};


/* =====================================================
   LATEST ANALYSIS FOR EVERY ACTIVE QUOTATION
===================================================== */

const getLatestDealHealth = async () => {

    const query = `
        SELECT

            q.id AS quotation_id,
            q.quotation_number,

            q.customer_id,
            c.company_name AS customer_name,

            q.sales_rep_id,
            u.name AS sales_rep_name,

            q.status,

            q.total_amount,

            q.created_at,
            q.updated_at,

            dh.id AS analysis_id,

            dh.health_score,
            dh.classification,

            dh.conversion_potential,
            dh.engagement_health,
            dh.financial_health,
            dh.deal_momentum,
            dh.risk_safety_index,

            dh.win_probability,
            dh.prediction_confidence,
            dh.predicted_outcome,

            dh.expected_revenue,
            dh.priority_score,
            dh.priority_classification,

            dh.is_anomaly,
            dh.anomaly_score,
            dh.anomaly_risk,

            dh.strengths,
            dh.concerns,
            dh.recommended_actions,

            dh.anomaly_reasons,
            dh.anomaly_deviations,

            dh.intelligence,

            dh.analyzed_at

        FROM quotations q

        JOIN customers c
            ON c.id = q.customer_id

        JOIN users u
            ON u.id = q.sales_rep_id


        LEFT JOIN LATERAL (

            SELECT *
            FROM deal_health_scores d

            WHERE d.quotation_id = q.id

            ORDER BY d.analyzed_at DESC

            LIMIT 1

        ) dh ON TRUE


        WHERE q.status NOT IN (
            'CANCELLED',
            'ACCEPTED'
        )

        ORDER BY q.updated_at DESC;
    `;


    const result =
        await pool.query(query);

    return result.rows;
};


/* =====================================================
   PREVIOUS ANALYSIS
===================================================== */

const getPreviousAnalysis = async (quotationId) => {

    const result = await pool.query(
        `
        SELECT
            health_score,
            analyzed_at

        FROM deal_health_scores

        WHERE quotation_id = $1

        ORDER BY analyzed_at DESC

        OFFSET 1
        LIMIT 1
        `,
        [quotationId]
    );


    return result.rows[0] || null;
};


/* =====================================================
   LATEST ANALYSIS FOR ONE DEAL
===================================================== */

const getLatestAnalysisByQuotationId =
    async (quotationId) => {

        const result = await pool.query(
            `
            SELECT *
            FROM deal_health_scores

            WHERE quotation_id = $1

            ORDER BY analyzed_at DESC

            LIMIT 1
            `,
            [quotationId]
        );


        return result.rows[0] || null;
    };


/* =====================================================
   HISTORY
===================================================== */

const getAnalysisHistory =
    async (quotationId, limit = 20) => {

        const result = await pool.query(
            `
            SELECT
                id,
                health_score,
                classification,

                win_probability,

                anomaly_score,
                anomaly_risk,

                analyzed_at

            FROM deal_health_scores

            WHERE quotation_id = $1

            ORDER BY analyzed_at DESC

            LIMIT $2
            `,
            [
                quotationId,
                limit
            ]
        );


        return result.rows;
    };


module.exports = {

    getQuotationById,

    saveAnalysis,

    getLatestDealHealth,

    getPreviousAnalysis,

    getLatestAnalysisByQuotationId,

    getAnalysisHistory
};
