-- Create table for historical exchange rates
CREATE TABLE public.historical_exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  making_date DATE NOT NULL,
  data_date DATE NOT NULL,
  currency TEXT NOT NULL, -- USD, JPY, CNY, CNY/USD
  selling_price NUMERIC,
  exchange_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for historical LME prices
CREATE TABLE public.historical_lme_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  making_date DATE NOT NULL,
  data_date DATE NOT NULL,
  metal TEXT NOT NULL, -- CU, AL, ZN
  price_usd NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for historical SHFE prices
CREATE TABLE public.historical_shfe_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  making_date DATE NOT NULL,
  data_date DATE NOT NULL,
  metal TEXT NOT NULL, -- CU, AL, ZN
  price_cny NUMERIC NOT NULL,
  price_usd NUMERIC, -- converted price
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.historical_exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_lme_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_shfe_prices ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read access to exchange rates"
  ON public.historical_exchange_rates FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to LME prices"
  ON public.historical_lme_prices FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to SHFE prices"
  ON public.historical_shfe_prices FOR SELECT
  USING (true);

-- Service role insert policies
CREATE POLICY "Allow service role insert to exchange rates"
  ON public.historical_exchange_rates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role insert to LME prices"
  ON public.historical_lme_prices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role insert to SHFE prices"
  ON public.historical_shfe_prices FOR INSERT
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_exchange_rates_date ON public.historical_exchange_rates(data_date DESC);
CREATE INDEX idx_exchange_rates_currency ON public.historical_exchange_rates(currency);
CREATE INDEX idx_lme_prices_date ON public.historical_lme_prices(data_date DESC);
CREATE INDEX idx_lme_prices_metal ON public.historical_lme_prices(metal);
CREATE INDEX idx_shfe_prices_date ON public.historical_shfe_prices(data_date DESC);
CREATE INDEX idx_shfe_prices_metal ON public.historical_shfe_prices(metal);