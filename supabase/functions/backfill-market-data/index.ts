import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Symbol mappings for Twelve Data API
const SYMBOL_MAPPINGS: Record<string, string> = {
  // FX pairs
  'FX:USD/THB': 'USD/THB',
  'FX:THB/JPY': 'THB/JPY',
  'FX:THB/CNY': 'THB/CNY',
  'FX:USD/CNY': 'USD/CNY',
  'FX:USD/JPY': 'USD/JPY',
  'FX:EUR/USD': 'EUR/USD',
  
  // LME metals
  'LME:CU': 'COPPER',
  'LME:AL': 'ALUMINUM',
  'LME:ZN': 'ZINC',
  'LME:PB': 'LEAD',
  'LME:NI': 'NICKEL',
  'LME:SN': 'TIN',
  
  // SHFE metals
  'SHFE:CU': 'CU',
  'SHFE:AL': 'AL',
  'SHFE:ZN': 'ZN',
  'SHFE:PB': 'PB',
  'SHFE:NI': 'NI',
  'SHFE:SN': 'SN',
};

const MARKETS_AND_SYMBOLS = [
  // FX pairs
  { market: 'FX', symbol: 'USD/THB' },
  { market: 'FX', symbol: 'THB/JPY' },
  { market: 'FX', symbol: 'THB/CNY' },
  { market: 'FX', symbol: 'USD/CNY' },
  { market: 'FX', symbol: 'USD/JPY' },
  { market: 'FX', symbol: 'EUR/USD' },
  
  // LME metals
  { market: 'LME', symbol: 'CU' },
  { market: 'LME', symbol: 'AL' },
  { market: 'LME', symbol: 'ZN' },
  { market: 'LME', symbol: 'PB' },
  { market: 'LME', symbol: 'NI' },
  { market: 'LME', symbol: 'SN' },
  
  // SHFE metals
  { market: 'SHFE', symbol: 'CU' },
  { market: 'SHFE', symbol: 'AL' },
  { market: 'SHFE', symbol: 'ZN' },
  { market: 'SHFE', symbol: 'PB' },
  { market: 'SHFE', symbol: 'NI' },
  { market: 'SHFE', symbol: 'SN' },
];

async function fetchHistoricalData(symbol: string, market: string, apiKey: string, daysBack: number = 60) {
  const mappedSymbol = SYMBOL_MAPPINGS[`${market}:${symbol}`];
  if (!mappedSymbol) {
    console.error(`No mapping found for ${market}:${symbol}`);
    return [];
  }

  // Use time_series endpoint for historical data
  const url = `https://api.twelvedata.com/time_series?symbol=${mappedSymbol}&interval=1day&outputsize=${daysBack}&apikey=${apiKey}`;
  
  console.log(`Fetching historical data for ${market}:${symbol} (${mappedSymbol})`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'error') {
      console.error(`Error fetching ${market}:${symbol}: ${data.message}`);
      return [];
    }
    
    if (!data.values || !Array.isArray(data.values)) {
      console.log(`No historical data available for ${market}:${symbol}`);
      return [];
    }
    
    // Transform the data into our format
    return data.values.map((item: any) => ({
      symbol,
      market,
      price: parseFloat(item.close),
      open_price: parseFloat(item.open),
      high_price: parseFloat(item.high),
      low_price: parseFloat(item.low),
      close_price: parseFloat(item.close),
      volume: item.volume ? parseInt(item.volume) : null,
      recorded_at: new Date(item.datetime).toISOString(),
    }));
  } catch (error) {
    console.error(`Error fetching data for ${market}:${symbol}:`, error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
    if (!apiKey) {
      throw new Error('TWELVE_DATA_API_KEY not found');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting historical data backfill...');
    
    let totalRecordsInserted = 0;
    const errors: string[] = [];

    // Process each market/symbol combination
    for (const { market, symbol } of MARKETS_AND_SYMBOLS) {
      try {
        console.log(`Processing ${market}:${symbol}...`);
        
        // Fetch 60 days of historical data
        const historicalData = await fetchHistoricalData(symbol, market, apiKey, 60);
        
        if (historicalData.length === 0) {
          console.log(`No data to insert for ${market}:${symbol}`);
          continue;
        }

        // Insert in batches to avoid timeout
        const batchSize = 100;
        for (let i = 0; i < historicalData.length; i += batchSize) {
          const batch = historicalData.slice(i, i + batchSize);
          
          const { error } = await supabase
            .from('market_prices')
            .insert(batch);

          if (error) {
            console.error(`Error inserting batch for ${market}:${symbol}:`, error);
            errors.push(`${market}:${symbol} - ${error.message}`);
          } else {
            totalRecordsInserted += batch.length;
            console.log(`Inserted ${batch.length} records for ${market}:${symbol}`);
          }
        }

        // Add delay to avoid rate limiting (Twelve Data has rate limits)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing ${market}:${symbol}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`${market}:${symbol} - ${errorMessage}`);
      }
    }

    console.log(`Backfill completed. Total records inserted: ${totalRecordsInserted}`);

    return new Response(
      JSON.stringify({
        success: true,
        totalRecordsInserted,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully backfilled ${totalRecordsInserted} historical records`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Backfill error:', error); // Log detailed error server-side only
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to backfill historical data',
        code: 'BACKFILL_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
