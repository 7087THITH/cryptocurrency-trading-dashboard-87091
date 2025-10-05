-- สร้าง cron job ให้รันทุกนาทีเพื่ออัพเดทข้อมูลจริง
SELECT cron.schedule(
  'record-real-market-prices',
  '* * * * *', -- ทุกนาที
  $$
  SELECT
    net.http_post(
        url:='https://dfepyvnbeiafyaysbojg.supabase.co/functions/v1/record-market-prices',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZXB5dm5iZWlhZnlheXNib2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDYwNjAsImV4cCI6MjA3NDkyMjA2MH0.HJesccSwplzU_5urAWGv9PgL5J-pXFaKFbaUEeXip0E"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);