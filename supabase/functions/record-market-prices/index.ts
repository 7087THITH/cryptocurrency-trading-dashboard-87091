import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Market data with simulated prices
const MARKET_DATA = [
  { symbol: 'USD/THB', market: 'FX', basePrice: 36.85 },
  { symbol: 'THB/JPY', market: 'FX', basePrice: 4.18 },
  { symbol: 'THB/CNY', market: 'FX', basePrice: 0.267 },
  { symbol: 'USD/CNY', market: 'FX', basePrice: 7.24 },
  { symbol: 'CU', market: 'LME', basePrice: 8245 },
  { symbol: 'AL', market: 'LME', basePrice: 2156 },
  { symbol: 'ZN', market: 'LME', basePrice: 2589 },
  { symbol: 'CU', market: 'SHFE', basePrice: 68420 },
  { symbol: 'AL', market: 'SHFE', basePrice: 18950 },
  { symbol: 'ZN', market: 'SHFE', basePrice: 21650 },
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting market price recording...');

    const records = MARKET_DATA.map(item => {
      // Simulate realistic price fluctuations
      const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const currentPrice = item.basePrice * (1 + fluctuation);
      const openPrice = item.basePrice * (1 + (Math.random() - 0.5) * 0.015);
      const highPrice = Math.max(currentPrice, openPrice) * (1 + Math.random() * 0.01);
      const lowPrice = Math.min(currentPrice, openPrice) * (1 - Math.random() * 0.01);
      const change24h = ((currentPrice - item.basePrice) / item.basePrice) * 100;

      return {
        symbol: item.symbol,
        market: item.market,
        price: Number(currentPrice.toFixed(4)),
        open_price: Number(openPrice.toFixed(4)),
        high_price: Number(highPrice.toFixed(4)),
        low_price: Number(lowPrice.toFixed(4)),
        close_price: Number(currentPrice.toFixed(4)),
        volume: Math.floor(Math.random() * 1000000),
        change_24h: Number(change24h.toFixed(4)),
        recorded_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabase
      .from('market_prices')
      .insert(records);

    if (error) {
      console.error('Error inserting data:', error);
      throw error;
    }

    console.log(`Successfully recorded ${records.length} market prices`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Recorded ${records.length} market prices`,
        records 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
