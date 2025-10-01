-- สร้างตารางสำหรับเก็บข้อมูลราคาตลาด
CREATE TABLE public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  market TEXT NOT NULL, -- LME, SHFE, FX
  price DECIMAL(12, 4) NOT NULL,
  open_price DECIMAL(12, 4),
  high_price DECIMAL(12, 4),
  low_price DECIMAL(12, 4),
  close_price DECIMAL(12, 4),
  volume BIGINT,
  change_24h DECIMAL(8, 4),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้าง index สำหรับค้นหาเร็วขึ้น
CREATE INDEX idx_market_prices_symbol ON public.market_prices(symbol);
CREATE INDEX idx_market_prices_recorded_at ON public.market_prices(recorded_at DESC);
CREATE INDEX idx_market_prices_symbol_recorded ON public.market_prices(symbol, recorded_at DESC);

-- เปิดใช้งาน RLS
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

-- สร้าง policy ให้ทุกคนอ่านได้ (public data)
CREATE POLICY "Allow public read access" 
ON public.market_prices 
FOR SELECT 
USING (true);

-- สร้าง policy ให้เฉพาะ service role เขียนได้
CREATE POLICY "Allow service role insert" 
ON public.market_prices 
FOR INSERT 
WITH CHECK (true);

-- เปิดใช้งาน realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_prices;