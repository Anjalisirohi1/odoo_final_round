from src.schemas.prediction import RevenueForecast

class RevenueForecaster:
    """
    Computes probability-weighted expected revenue forecasts.
    Expected Revenue = Quotation Value * Conversion Probability
    """
    
    def forecast(self, quotation_value: float, conversion_probability: float) -> RevenueForecast:
        val = max(0.0, float(quotation_value))
        prob = min(1.0, max(0.0, float(conversion_probability)))
        
        expected = round(val * prob, 2)
        
        return RevenueForecast(
            quotation_value=round(val, 2),
            conversion_probability=round(prob, 4),
            expected_revenue=expected
        )
