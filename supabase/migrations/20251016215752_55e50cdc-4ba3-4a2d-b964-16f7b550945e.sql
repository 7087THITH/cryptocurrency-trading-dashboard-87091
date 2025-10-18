-- Fix search_path security warning for calculate_exchange_rate_averages function
CREATE OR REPLACE FUNCTION calculate_exchange_rate_averages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Calculate daily average (same day data)
  UPDATE historical_exchange_rates er
  SET daily_avg = (
    SELECT AVG(exchange_rate)
    FROM historical_exchange_rates
    WHERE from_currency = er.from_currency
      AND to_currency = er.to_currency
      AND data_date = er.data_date
  ),
  
  -- Calculate weekly average (7 days)
  weekly_avg = (
    SELECT AVG(exchange_rate)
    FROM historical_exchange_rates
    WHERE from_currency = er.from_currency
      AND to_currency = er.to_currency
      AND data_date >= er.data_date - INTERVAL '7 days'
      AND data_date <= er.data_date
  ),
  
  -- Calculate monthly average (30 days)
  monthly_avg = (
    SELECT AVG(exchange_rate)
    FROM historical_exchange_rates
    WHERE from_currency = er.from_currency
      AND to_currency = er.to_currency
      AND data_date >= er.data_date - INTERVAL '30 days'
      AND data_date <= er.data_date
  ),
  
  -- Calculate yearly average (365 days)
  yearly_avg = (
    SELECT AVG(exchange_rate)
    FROM historical_exchange_rates
    WHERE from_currency = er.from_currency
      AND to_currency = er.to_currency
      AND data_date >= er.data_date - INTERVAL '365 days'
      AND data_date <= er.data_date
  ),
  
  avg_calculated_at = now();
END;
$$;