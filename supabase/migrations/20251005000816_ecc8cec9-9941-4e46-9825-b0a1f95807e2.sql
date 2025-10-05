-- Create daily market summary table
CREATE TABLE IF NOT EXISTS public.daily_market_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  market TEXT NOT NULL,
  trade_date DATE NOT NULL,
  open_price NUMERIC NOT NULL,
  close_price NUMERIC NOT NULL,
  high_price NUMERIC NOT NULL,
  low_price NUMERIC NOT NULL,
  avg_price NUMERIC NOT NULL,
  total_volume BIGINT,
  price_change NUMERIC,
  percent_change NUMERIC,
  data_points INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(symbol, market, trade_date)
);

-- Enable RLS
ALTER TABLE public.daily_market_summary ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can read daily summary"
ON public.daily_market_summary
FOR SELECT
USING (true);

-- Create policy for admins to insert
CREATE POLICY "Only admins can insert daily summary"
ON public.daily_market_summary
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for service role to insert/update
CREATE POLICY "Service role can manage daily summary"
ON public.daily_market_summary
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_daily_summary_symbol_market ON public.daily_market_summary(symbol, market);
CREATE INDEX idx_daily_summary_trade_date ON public.daily_market_summary(trade_date DESC);
CREATE INDEX idx_daily_summary_symbol_date ON public.daily_market_summary(symbol, trade_date DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_daily_summary_updated_at
BEFORE UPDATE ON public.daily_market_summary
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily summary job to run at market close times
-- Run at 16:30 Bangkok time (09:30 UTC) for LME/SHFE markets
SELECT cron.schedule(
  'daily-market-summary-job',
  '30 9 * * *', -- 16:30 Bangkok time (09:30 UTC)
  $$
  SELECT
    net.http_post(
        url:='https://dfepyvnbeiafyaysbojg.supabase.co/functions/v1/create-daily-summary',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZXB5dm5iZWlhZnlheXNib2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDYwNjAsImV4cCI6MjA3NDkyMjA2MH0.HJesccSwplzU_5urAWGv9PgL5J-pXFaKFbaUEeXip0E"}'::jsonb,
        body:=concat('{"date": "', now()::date, '"}')::jsonb
    ) as request_id;
  $$
);