import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketPrice {
  symbol: string;
  market: string;
  price: number;
  high_price: number;
  low_price: number;
  open_price: number;
  close_price: number;
  volume: number;
  recorded_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting daily market summary creation...');

    // Get the date to summarize (yesterday or specified date)
    const body = await req.json().catch(() => ({}));
    const targetDate = body.date || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`Creating summary for date: ${targetDate}`);

    // Get all unique symbol-market combinations
    const { data: symbols, error: symbolError } = await supabase
      .from('market_prices')
      .select('symbol, market')
      .gte('recorded_at', `${targetDate}T00:00:00`)
      .lt('recorded_at', `${targetDate}T23:59:59`)
      .order('symbol')
      .order('market');

    if (symbolError) {
      console.error('Error fetching symbols:', symbolError);
      throw symbolError;
    }

    // Get unique combinations
    const uniqueCombos = Array.from(
      new Set(symbols?.map(s => `${s.symbol}-${s.market}`))
    ).map(combo => {
      const [symbol, market] = combo.split('-');
      return { symbol, market };
    });

    console.log(`Found ${uniqueCombos.length} unique symbol-market combinations`);

    const summaries = [];

    // Process each symbol-market combination
    for (const { symbol, market } of uniqueCombos) {
      console.log(`Processing ${market} ${symbol}...`);

      // Get all prices for this symbol on this date
      const { data: prices, error: pricesError } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', symbol)
        .eq('market', market)
        .gte('recorded_at', `${targetDate}T00:00:00`)
        .lt('recorded_at', `${targetDate}T23:59:59`)
        .order('recorded_at', { ascending: true });

      if (pricesError || !prices || prices.length === 0) {
        console.log(`No data for ${market} ${symbol}`);
        continue;
      }

      // Calculate daily summary
      const openPrice = prices[0].price;
      const closePrice = prices[prices.length - 1].price;
      const highPrice = Math.max(...prices.map(p => p.high_price || p.price));
      const lowPrice = Math.min(...prices.map(p => p.low_price || p.price));
      const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
      const totalVolume = prices.reduce((sum, p) => sum + (p.volume || 0), 0);
      const priceChange = closePrice - openPrice;
      const percentChange = (priceChange / openPrice) * 100;

      summaries.push({
        symbol,
        market,
        trade_date: targetDate,
        open_price: openPrice,
        close_price: closePrice,
        high_price: highPrice,
        low_price: lowPrice,
        avg_price: avgPrice,
        total_volume: totalVolume,
        price_change: priceChange,
        percent_change: percentChange,
        data_points: prices.length,
      });
    }

    console.log(`Calculated ${summaries.length} daily summaries`);

    // Insert or update summaries
    if (summaries.length > 0) {
      const { error: insertError } = await supabase
        .from('daily_market_summary')
        .upsert(summaries, {
          onConflict: 'symbol,market,trade_date',
          ignoreDuplicates: false,
        });

      if (insertError) {
        console.error('Error inserting summaries:', insertError);
        throw insertError;
      }

      console.log(`Successfully saved ${summaries.length} daily summaries`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: targetDate,
        summaries_created: summaries.length,
        message: `Created ${summaries.length} daily summaries for ${targetDate}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating daily summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
