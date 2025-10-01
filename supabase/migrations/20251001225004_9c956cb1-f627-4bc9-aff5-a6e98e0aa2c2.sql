-- เปิดใช้งาน pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- เปิดใช้งาน pg_net extension สำหรับเรียก HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;

-- สร้าง cron job บันทึกข้อมูลทุก 15 นาที
SELECT cron.schedule(
  'record-market-prices-every-15min',
  '*/15 * * * *', -- ทุก 15 นาที
  $$
  SELECT
    net.http_post(
        url:='https://dfepyvnbeiafyaysbojg.supabase.co/functions/v1/record-market-prices',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZXB5dm5iZWlhZnlheXNib2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDYwNjAsImV4cCI6MjA3NDkyMjA2MH0.HJesccSwplzU_5urAWGv9PgL5J-pXFaKFbaUEeXip0E"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- สร้าง cron job บันทึกข้อมูลตอนตลาดปิด (เวลา 16:00 UTC / 23:00 เวลาไทย)
SELECT cron.schedule(
  'record-market-close-prices',
  '0 16 * * 1-5', -- ทุกวันจันทร์-ศุกร์ เวลา 16:00 UTC
  $$
  SELECT
    net.http_post(
        url:='https://dfepyvnbeiafyaysbojg.supabase.co/functions/v1/record-market-prices',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZXB5dm5iZWlhZnlheXNib2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDYwNjAsImV4cCI6MjA3NDkyMjA2MH0.HJesccSwplzU_5urAWGv9PgL5J-pXFaKFbaUEeXip0E"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '", "market_close": true}')::jsonb
    ) as request_id;
  $$
);