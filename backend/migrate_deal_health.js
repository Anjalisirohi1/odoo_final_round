const { pool } = require('./src/config/db');

const run = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS deal_health_scores (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                quotation_id UUID NOT NULL,

                health_score NUMERIC(5,2),
                classification VARCHAR(30),

                conversion_potential NUMERIC(5,4),
                engagement_health NUMERIC(5,4),
                financial_health NUMERIC(5,4),
                deal_momentum NUMERIC(5,4),
                risk_safety_index NUMERIC(5,4),

                win_probability NUMERIC(6,5),
                prediction_confidence NUMERIC(6,5),
                predicted_outcome VARCHAR(50),

                expected_revenue NUMERIC(14,2),
                priority_score NUMERIC(6,2),
                priority_classification VARCHAR(50),

                is_anomaly BOOLEAN DEFAULT FALSE,
                anomaly_score NUMERIC(6,5),
                anomaly_risk VARCHAR(30),

                strengths JSONB DEFAULT '[]'::jsonb,
                concerns JSONB DEFAULT '[]'::jsonb,
                recommended_actions JSONB DEFAULT '[]'::jsonb,

                anomaly_reasons JSONB DEFAULT '[]'::jsonb,
                anomaly_deviations JSONB DEFAULT '[]'::jsonb,

                intelligence JSONB,

                analyzed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_deal_health_quotation
                    FOREIGN KEY (quotation_id)
                    REFERENCES quotations(id)
                    ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_deal_health_quotation
            ON deal_health_scores(quotation_id);

            CREATE INDEX IF NOT EXISTS idx_deal_health_analyzed_at
            ON deal_health_scores(analyzed_at DESC);

            CREATE INDEX IF NOT EXISTS idx_deal_health_risk
            ON deal_health_scores(anomaly_risk);
        `);
        console.log("Migration successful");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

run();
