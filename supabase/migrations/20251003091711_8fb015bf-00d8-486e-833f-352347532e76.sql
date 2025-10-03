-- Create monthly market averages table
CREATE TABLE public.monthly_market_averages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL, -- USD/THB, THB/JPY, THB/CNY, USD/CNY, CU, AL, ZN
  market TEXT NOT NULL, -- FX, LME, SHFE
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  avg_price NUMERIC NOT NULL,
  avg_high NUMERIC,
  avg_low NUMERIC,
  data_points INTEGER, -- number of records used for calculation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(symbol, market, year, month)
);

-- Create yearly market averages table
CREATE TABLE public.yearly_market_averages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL, -- USD/THB, THB/JPY, THB/CNY, USD/CNY, CU, AL, ZN
  market TEXT NOT NULL, -- FX, LME, SHFE
  year INTEGER NOT NULL,
  avg_price NUMERIC NOT NULL,
  avg_high NUMERIC,
  avg_low NUMERIC,
  data_points INTEGER, -- number of records used for calculation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(symbol, market, year)
);

-- Enable RLS
ALTER TABLE public.monthly_market_averages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yearly_market_averages ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_monthly_averages_symbol_market ON public.monthly_market_averages(symbol, market);
CREATE INDEX idx_monthly_averages_year_month ON public.monthly_market_averages(year, month);
CREATE INDEX idx_yearly_averages_symbol_market ON public.yearly_market_averages(symbol, market);
CREATE INDEX idx_yearly_averages_year ON public.yearly_market_averages(year);

-- RLS Policies for monthly_market_averages
CREATE POLICY "Public can read monthly averages"
ON public.monthly_market_averages
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert monthly averages"
ON public.monthly_market_averages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update monthly averages"
ON public.monthly_market_averages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for yearly_market_averages
CREATE POLICY "Public can read yearly averages"
ON public.yearly_market_averages
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert yearly averages"
ON public.yearly_market_averages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update yearly averages"
ON public.yearly_market_averages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_monthly_market_averages_updated_at
BEFORE UPDATE ON public.monthly_market_averages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_yearly_market_averages_updated_at
BEFORE UPDATE ON public.yearly_market_averages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();