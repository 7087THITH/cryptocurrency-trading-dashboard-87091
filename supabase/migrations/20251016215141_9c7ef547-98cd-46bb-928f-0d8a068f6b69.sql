
-- Delete market price data after 2025-10-11
DELETE FROM market_prices 
WHERE recorded_at > '2025-10-11 23:59:59+00';

-- Delete daily market summary data after 2025-10-11
DELETE FROM daily_market_summary 
WHERE trade_date > '2025-10-11';

-- Delete monthly/yearly averages data after 2025-10-11 (if any)
DELETE FROM monthly_market_averages 
WHERE created_at > '2025-10-11 23:59:59+00';

DELETE FROM yearly_market_averages 
WHERE created_at > '2025-10-11 23:59:59+00';

-- Note: No historical data found after 2025-10-11, but cleaning up just in case
DELETE FROM historical_exchange_rates 
WHERE data_date > '2025-10-11';

DELETE FROM historical_lme_prices 
WHERE data_date > '2025-10-11';

DELETE FROM historical_shfe_prices 
WHERE data_date > '2025-10-11';
