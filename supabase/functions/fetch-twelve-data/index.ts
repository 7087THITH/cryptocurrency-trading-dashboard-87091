import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping our symbols to Twelve Data symbols
const SYMBOL_MAPPINGS = [
  { symbol: 'USD/THB', market: 'FX', twelveDataSymbol: 'USD/THB', interval: '15min' },
  { symbol: 'THB/JPY', market: 'FX', twelveDataSymbol: 'THB/JPY', interval: '15min' },
  { symbol: 'THB/CNY', market: 'FX', twelveDataSymbol: 'THB/CNY', interval: '15min' },
  { symbol: 'USD/CNY', market: 'FX', twelveDataSymbol: 'USD/CNY', interval: '15min' },
  { symbol: 'CU', market: 'SHFE', twelveDataSymbol: 'CU', interval: '1h' },
  { symbol: 'AL', market: 'SHFE', twelveDataSymbol: 'AL', interval: '1h' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const twelveDataApiKey = Deno.env.get('TWELVE_DATA_API_KEY')!;
    
    if (!twelveDataApiKey) {
      throw new Error('TWELVE_DATA_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking for missing market data...');

    // Check which symbols don't have data
    const missingSymbols = [];
    
    for (const mapping of SYMBOL_MAPPINGS) {
      const { data, error } = await supabase
        .from('market_prices')
        .select('id')
        .eq('symbol', mapping.symbol)
        .eq('market', mapping.market)
        .limit(1);

      if (error) {
        console.error(`Error checking ${mapping.symbol}:`, error);
        continue;
      }

      if (!data || data.length === 0) {
        missingSymbols.push(mapping);
        console.log(`Missing data for: ${mapping.symbol} (${mapping.market})`);
      }
    }

    if (missingSymbols.length === 0) {
      console.log('All symbols have data');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All symbols already have data',
          missingSymbols: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`Fetching data for ${missingSymbols.length} symbols from Twelve Data...`);

    const records = [];

    for (const mapping of missingSymbols) {
      try {
        const url = `https://api.twelvedata.com/time_series?symbol=${mapping.twelveDataSymbol}&interval=${mapping.interval}&outputsize=1&apikey=${twelveDataApiKey}`;
        
        console.log(`Fetching: ${mapping.symbol} (${mapping.market})`);
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'error') {
          console.error(`Error from Twelve Data for ${mapping.symbol}:`, data.message);
          continue;
        }

        if (!data.values || data.values.length === 0) {
          console.log(`No values returned for ${mapping.symbol}`);
          continue;
        }

        const latestData = data.values[0];
        
        // Parse the price data
        const closePrice = parseFloat(latestData.close);
        const openPrice = parseFloat(latestData.open);
        const highPrice = parseFloat(latestData.high);
        const lowPrice = parseFloat(latestData.low);
        const volume = parseInt(latestData.volume || '0');
        
        // Calculate 24h change
        const change24h = ((closePrice - openPrice) / openPrice) * 100;

        const record = {
          symbol: mapping.symbol,
          market: mapping.market,
          price: Number(closePrice.toFixed(4)),
          open_price: Number(openPrice.toFixed(4)),
          high_price: Number(highPrice.toFixed(4)),
          low_price: Number(lowPrice.toFixed(4)),
          close_price: Number(closePrice.toFixed(4)),
          volume: volume,
          change_24h: Number(change24h.toFixed(4)),
          recorded_at: new Date().toISOString(),
        };

        records.push(record);
        console.log(`Successfully parsed data for ${mapping.symbol}:`, record);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Error fetching data for ${mapping.symbol}:`, error);
        continue;
      }
    }

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No new data could be fetched',
          attempted: missingSymbols.length 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Insert records into database
    const { error: insertError } = await supabase
      .from('market_prices')
      .insert(records);

    if (insertError) {
      console.error('Error inserting data:', insertError);
      throw insertError;
    }

    console.log(`Successfully recorded ${records.length} market prices from Twelve Data`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Recorded ${records.length} market prices from Twelve Data`,
        records 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error); // Log detailed error server-side only
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch market data',
        code: 'FETCH_ERROR'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});