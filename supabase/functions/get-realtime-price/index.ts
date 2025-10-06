import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, market } = await req.json();
    
    if (!symbol || !market) {
      throw new Error('Symbol and market are required');
    }

    console.log(`Fetching real-time price for ${symbol} (${market}) from database`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the latest price from database
    const { data: latestPrice, error } = await supabase
      .from('market_prices')
      .select('*')
      .eq('symbol', symbol)
      .eq('market', market)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !latestPrice) {
      console.error('Error fetching from database:', error);
      throw new Error('No price data available in database');
    }

    const result = {
      symbol: latestPrice.symbol,
      market: latestPrice.market,
      price: Number(latestPrice.price),
      open_price: Number(latestPrice.open_price || latestPrice.price),
      high_price: Number(latestPrice.high_price || latestPrice.price),
      low_price: Number(latestPrice.low_price || latestPrice.price),
      close_price: Number(latestPrice.close_price || latestPrice.price),
      volume: latestPrice.volume || 0,
      change_24h: Number(latestPrice.change_24h || 0),
      timestamp: latestPrice.recorded_at,
    };

    console.log(`Successfully fetched real-time price for ${symbol} from database:`, result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in get-realtime-price:', error);
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
