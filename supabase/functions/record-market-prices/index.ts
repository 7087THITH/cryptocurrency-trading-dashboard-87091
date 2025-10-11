import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Market data to fetch from Twelve Data API
const MARKET_DATA = [
  { symbol: 'USD/THB', market: 'FX', twelveDataSymbol: 'USD/THB' },
  { symbol: 'THB/JPY', market: 'FX', twelveDataSymbol: 'THB/JPY' },
  { symbol: 'THB/CNY', market: 'FX', twelveDataSymbol: 'THB/CNY' },
  { symbol: 'USD/CNY', market: 'FX', twelveDataSymbol: 'USD/CNY' },
  { symbol: 'CU', market: 'LME', twelveDataSymbol: 'HG' },  // Copper futures
  { symbol: 'AL', market: 'LME', twelveDataSymbol: 'ALI' }, // Aluminum
  { symbol: 'ZN', market: 'LME', twelveDataSymbol: 'ZN' },  // Zinc
  { symbol: 'CU', market: 'SHFE', twelveDataSymbol: 'HG' },
  { symbol: 'AL', market: 'SHFE', twelveDataSymbol: 'ALI' },
  { symbol: 'ZN', market: 'SHFE', twelveDataSymbol: 'ZN' },
];

// Fetch real price from Twelve Data API
async function fetchRealPrice(symbol: string, market: string, twelveDataSymbol: string, apiKey: string) {
  try {
    // Get current price
    const priceUrl = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(twelveDataSymbol)}&apikey=${apiKey}`;
    const priceResponse = await fetch(priceUrl);
    const priceData = await priceResponse.json();

    if (priceData.status === 'error' || !priceData.price) {
      console.error(`Error fetching ${symbol}:`, priceData.message);
      return null;
    }

    const price = parseFloat(priceData.price);

    // Get time series for OHLC data
    const timeSeriesUrl = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(twelveDataSymbol)}&interval=1day&outputsize=1&apikey=${apiKey}`;
    const timeSeriesResponse = await fetch(timeSeriesUrl);
    const timeSeriesData = await timeSeriesResponse.json();

    let highPrice = price;
    let lowPrice = price;
    let openPrice = price;
    let closePrice = price;
    let volume = 0;

    if (timeSeriesData.values && timeSeriesData.values.length > 0) {
      const latestData = timeSeriesData.values[0];
      highPrice = parseFloat(latestData.high);
      lowPrice = parseFloat(latestData.low);
      openPrice = parseFloat(latestData.open);
      closePrice = parseFloat(latestData.close);
      volume = parseInt(latestData.volume || '0');
    }

    const change24h = ((price - openPrice) / openPrice) * 100;

    return {
      symbol,
      market,
      price: Number(price.toFixed(4)),
      open_price: Number(openPrice.toFixed(4)),
      high_price: Number(highPrice.toFixed(4)),
      low_price: Number(lowPrice.toFixed(4)),
      close_price: Number(closePrice.toFixed(4)),
      volume,
      change_24h: Number(change24h.toFixed(4)),
      recorded_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the request is from an authorized source (cron or admin)
    const authHeader = req.headers.get('Authorization');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Allow requests with the anon key (from cron jobs) or service role key
    if (!authHeader || !authHeader.includes(anonKey.substring(0, 20))) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const twelveDataApiKey = Deno.env.get('TWELVE_DATA_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting REAL market price recording from Twelve Data API...');

    // Fetch real prices from Twelve Data API
    const fetchPromises = MARKET_DATA.map(item => 
      fetchRealPrice(item.symbol, item.market, item.twelveDataSymbol, twelveDataApiKey)
    );

    const results = await Promise.all(fetchPromises);
    const records = results.filter(record => record !== null);

    if (records.length === 0) {
      throw new Error('Failed to fetch any market prices');
    }

    console.log(`Fetched ${records.length} real market prices, inserting to database...`);

    const { data, error } = await supabase
      .from('market_prices')
      .insert(records);

    if (error) {
      console.error('Error inserting data:', error);
      throw error;
    }

    console.log(`✅ Successfully recorded ${records.length} REAL market prices from Twelve Data`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Recorded ${records.length} REAL market prices`,
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
