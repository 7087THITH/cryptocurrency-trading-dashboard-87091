import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping our symbols to Twelve Data symbols
const SYMBOL_MAPPINGS: Record<string, string> = {
  'USDTHB': 'USD/THB',
  'THBJPY': 'THB/JPY',
  'THBCNY': 'THB/CNY',
  'USDCNY': 'USD/CNY',
  // For metals, Twelve Data uses different symbols
  'CU-SHFE': 'HG',  // Copper futures
  'AL-SHFE': 'ALI', // Aluminum
  'ZN-SHFE': 'ZN',  // Zinc futures
  'CU-LME': 'HG',   // LME Copper
  'AL-LME': 'ALI',  // LME Aluminum
  'ZN-LME': 'ZN',   // LME Zinc
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, market } = await req.json();
    const twelveDataApiKey = Deno.env.get('TWELVE_DATA_API_KEY');
    
    if (!twelveDataApiKey) {
      throw new Error('TWELVE_DATA_API_KEY is not configured');
    }

    if (!symbol || !market) {
      throw new Error('Symbol and market are required');
    }

    // Create lookup key
    const lookupKey = `${symbol}-${market}`;
    const twelveDataSymbol = SYMBOL_MAPPINGS[lookupKey] || symbol;

    console.log(`Fetching real-time price for ${symbol} (${market}), mapped to: ${twelveDataSymbol}`);

    // Use Twelve Data's price endpoint for real-time data
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(twelveDataSymbol)}&apikey=${twelveDataApiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'error') {
      console.error(`Error from Twelve Data: ${data.message}`);
      throw new Error(data.message || 'Failed to fetch data from Twelve Data');
    }

    if (!data.price) {
      console.error('No price data returned:', data);
      throw new Error('No price data available');
    }

    const price = parseFloat(data.price);

    // Get time series data for high/low
    const timeSeriesUrl = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(twelveDataSymbol)}&interval=1day&outputsize=1&apikey=${twelveDataApiKey}`;
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

    const result = {
      symbol,
      market,
      price: Number(price.toFixed(4)),
      open_price: Number(openPrice.toFixed(4)),
      high_price: Number(highPrice.toFixed(4)),
      low_price: Number(lowPrice.toFixed(4)),
      close_price: Number(closePrice.toFixed(4)),
      volume,
      change_24h: Number(change24h.toFixed(4)),
      timestamp: new Date().toISOString(),
    };

    console.log(`Successfully fetched real-time price for ${symbol}:`, result);

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
