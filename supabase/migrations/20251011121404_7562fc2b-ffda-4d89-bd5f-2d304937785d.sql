-- Recreate cron jobs with correct schema reference for pg_net
-- After moving pg_net to extensions schema

-- Delete existing cron jobs if they exist
SELECT cron.unschedule('record-market-prices-every-15min');
SELECT cron.unschedule('record-market-close-prices');

-- Recreate cron job to record market prices every 15 minutes
SELECT cron.schedule(
  'record-market-prices-every-15min',
  '*/15 * * * *',
  $$
  SELECT
    extensions.http_post(
        url:='https://dfepyvnbeiafyaysbojg.supabase.co/functions/v1/record-market-prices',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZXB5dm5iZWlhZnlheXNib2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDYwNjAsImV4cCI6MjA3NDkyMjA2MH0.HJesccSwplzU_5urAWGv9PgL5J-pXFaKFbaUEeXip0E"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Recreate cron job to record market close prices
SELECT cron.schedule(
  'record-market-close-prices',
  '0 16 * * 1-5',
  $$
  SELECT
    extensions.http_post(
        url:='https://dfepyvnbeiafyaysbojg.supabase.co/functions/v1/record-market-prices',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZXB5dm5iZWlhZnlheXNib2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDYwNjAsImV4cCI6MjA3NDkyMjA2MH0.HJesccSwplzU_5urAWGv9PgL5J-pXFaKFbaUEeXip0E"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '", "market_close": true}')::jsonb
    ) as request_id;
  $$
);