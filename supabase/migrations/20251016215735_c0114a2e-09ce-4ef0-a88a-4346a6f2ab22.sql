-- Improve historical_exchange_rates table structure
-- Add columns for explicit currency pair (from/to)
ALTER TABLE historical_exchange_rates 
ADD COLUMN IF NOT EXISTS from_currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS to_currency text;

-- Update existing records to use new structure
UPDATE historical_exchange_rates 
SET to_currency = currency
WHERE to_currency IS NULL;

-- Add average columns for different time periods
ALTER TABLE historical_exchange_rates
ADD COLUMN IF NOT EXISTS daily_avg numeric,
ADD COLUMN IF NOT EXISTS weekly_avg numeric,
ADD COLUMN IF NOT EXISTS monthly_avg numeric,
ADD COLUMN IF NOT EXISTS yearly_avg numeric;

-- Add columns to track calculation metadata
ALTER TABLE historical_exchange_rates
ADD COLUMN IF NOT EXISTS avg_calculated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS data_source text DEFAULT 'manual';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_pair 
ON historical_exchange_rates(from_currency, to_currency, data_date DESC);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_data_date 
ON historical_exchange_rates(data_date DESC);

-- Create a function to calculate and update averages
CREATE OR REPLACE FUNCTION calculate_exchange_rate_averages()
RETURNS void
LANGUAGE plpgsql
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

-- Add comment to describe the table
COMMENT ON TABLE historical_exchange_rates IS 'Stores currency exchange rates with from/to currency pairs and calculated averages for different time periods';

COMMENT ON COLUMN historical_exchange_rates.from_currency IS 'Base currency (e.g., USD, THB)';
COMMENT ON COLUMN historical_exchange_rates.to_currency IS 'Target currency to convert to';
COMMENT ON COLUMN historical_exchange_rates.daily_avg IS 'Average exchange rate for the same day';
COMMENT ON COLUMN historical_exchange_rates.weekly_avg IS 'Average exchange rate for the past 7 days';
COMMENT ON COLUMN historical_exchange_rates.monthly_avg IS 'Average exchange rate for the past 30 days';
COMMENT ON COLUMN historical_exchange_rates.yearly_avg IS 'Average exchange rate for the past 365 days';