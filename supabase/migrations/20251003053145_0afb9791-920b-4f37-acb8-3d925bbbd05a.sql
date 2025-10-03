-- Add unique constraint to prevent duplicate entries
ALTER TABLE public.historical_exchange_rates 
ADD CONSTRAINT unique_exchange_rate_per_date UNIQUE (data_date, currency);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.historical_exchange_rates(data_date);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency ON public.historical_exchange_rates(currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date_currency ON public.historical_exchange_rates(data_date, currency);