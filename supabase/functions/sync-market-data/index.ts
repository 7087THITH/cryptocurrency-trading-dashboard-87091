import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Market configuration
const MARKETS_CONFIG = [
  // FX pairs
  { symbol: 'USD/THB', market: 'FX', twelveDataSymbol: 'USD/THB' },
  { symbol: 'THB/JPY', market: 'FX', twelveDataSymbol: 'THB/JPY' },
  { symbol: 'THB/CNY', market: 'FX', twelveDataSymbol: 'THB/CNY' },
  { symbol: 'USD/CNY', market: 'FX', twelveDataSymbol: 'USD/CNY' },
  
  // LME metals
  { symbol: 'CU', market: 'LME', twelveDataSymbol: 'HG' },
  { symbol: 'AL', market: 'LME', twelveDataSymbol: 'ALI' },
  { symbol: 'ZN', market: 'LME', twelveDataSymbol: 'ZN' },
  { symbol: 'PB', market: 'LME', twelveDataSymbol: 'PB' },
  { symbol: 'NI', market: 'LME', twelveDataSymbol: 'NI' },
  { symbol: 'SN', market: 'LME', twelveDataSymbol: 'SN' },
  
  // SHFE metals
  { symbol: 'CU', market: 'SHFE', twelveDataSymbol: 'HG' },
  { symbol: 'AL', market: 'SHFE', twelveDataSymbol: 'ALI' },
  { symbol: 'ZN', market: 'SHFE', twelveDataSymbol: 'ZN' },
  { symbol: 'PB', market: 'SHFE', twelveDataSymbol: 'PB' },
  { symbol: 'NI', market: 'SHFE', twelveDataSymbol: 'NI' },
  { symbol: 'SN', market: 'SHFE', twelveDataSymbol: 'SN' },
];

interface MarketData {
  symbol: string;
  market: string;
  price: number;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume: number;
  change_24h: number;
  recorded_at: string;
}

// Fetch real-time price with fallback
async function fetchMarketPrice(
  symbol: string, 
  market: string, 
  twelveDataSymbol: string, 
  apiKey: string,
  supabase: any
): Promise<MarketData | null> {
  try {
    // Try to fetch real-time price from API
    const priceUrl = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(twelveDataSymbol)}&apikey=${apiKey}`;
    const priceResponse = await fetch(priceUrl);
    const priceData = await priceResponse.json();

    if (priceData.status === 'error' || !priceData.price) {
      console.log(`⚠️ API failed for ${symbol}:${market}, falling back to last known price...`);
      return await getLastKnownPrice(symbol, market, supabase);
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

    const change24h = openPrice > 0 ? ((price - openPrice) / openPrice) * 100 : 0;

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
    console.error(`❌ Error fetching ${symbol}:${market}:`, error);
    return await getLastKnownPrice(symbol, market, supabase);
  }
}

// Get last known price from database as fallback
async function getLastKnownPrice(symbol: string, market: string, supabase: any): Promise<MarketData | null> {
  try {
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .eq('symbol', symbol)
      .eq('market', market)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.log(`📊 No historical data for ${symbol}:${market}, will need backfill`);
      return null;
    }

    console.log(`✅ Using last known price for ${symbol}:${market} from ${data.recorded_at}`);
    
    // Update timestamp but keep the price data
    return {
      ...data,
      recorded_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching last known price for ${symbol}:${market}:`, error);
    return null;
  }
}

// Fetch historical data for trend calculation
async function fetchHistoricalData(
  symbol: string, 
  market: string, 
  twelveDataSymbol: string, 
  apiKey: string,
  days: number = 365
): Promise<any[]> {
  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(twelveDataSymbol)}&interval=1day&outputsize=${days}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'error' || !data.values) {
      console.log(`⚠️ Could not fetch historical data for ${symbol}:${market}`);
      return [];
    }

    return data.values.map((item: any) => ({
      symbol,
      market,
      price: parseFloat(item.close),
      open_price: parseFloat(item.open),
      high_price: parseFloat(item.high),
      low_price: parseFloat(item.low),
      close_price: parseFloat(item.close),
      volume: item.volume ? parseInt(item.volume) : 0,
      recorded_at: new Date(item.datetime).toISOString(),
    }));
  } catch (error) {
    console.error(`Error fetching historical for ${symbol}:${market}:`, error);
    return [];
  }
}

// Calculate and save monthly averages
async function updateMonthlyAverages(symbol: string, market: string, supabase: any) {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: prices } = await supabase
      .from('market_prices')
      .select('*')
      .eq('symbol', symbol)
      .eq('market', market)
      .gte('recorded_at', oneYearAgo.toISOString())
      .order('recorded_at', { ascending: true });

    if (!prices || prices.length === 0) return;

    // Group by month
    const monthlyGroups: { [key: string]: any[] } = {};
    prices.forEach((price: any) => {
      const date = new Date(price.recorded_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyGroups[key]) monthlyGroups[key] = [];
      monthlyGroups[key].push(price);
    });

    // Calculate and upsert averages
    for (const [yearMonth, items] of Object.entries(monthlyGroups)) {
      const [year, month] = yearMonth.split('-').map(Number);
      
      const avgPrice = items.reduce((sum, p) => sum + Number(p.price), 0) / items.length;
      const avgHigh = items.reduce((sum, p) => sum + Number(p.high_price), 0) / items.length;
      const avgLow = items.reduce((sum, p) => sum + Number(p.low_price), 0) / items.length;

      await supabase
        .from('monthly_market_averages')
        .upsert({
          symbol,
          market,
          year,
          month,
          avg_price: Number(avgPrice.toFixed(4)),
          avg_high: Number(avgHigh.toFixed(4)),
          avg_low: Number(avgLow.toFixed(4)),
          data_points: items.length,
        });
    }

    console.log(`📈 Updated monthly averages for ${symbol}:${market}`);
  } catch (error) {
    console.error(`Error updating monthly averages for ${symbol}:${market}:`, error);
  }
}

// Calculate and save yearly averages
async function updateYearlyAverages(symbol: string, market: string, supabase: any) {
  try {
    const { data: prices } = await supabase
      .from('market_prices')
      .select('*')
      .eq('symbol', symbol)
      .eq('market', market)
      .gte('recorded_at', '2021-01-01')
      .order('recorded_at', { ascending: true });

    if (!prices || prices.length === 0) return;

    // Group by year
    const yearlyGroups: { [key: number]: any[] } = {};
    prices.forEach((price: any) => {
      const year = new Date(price.recorded_at).getFullYear();
      if (!yearlyGroups[year]) yearlyGroups[year] = [];
      yearlyGroups[year].push(price);
    });

    // Calculate and upsert averages
    for (const [year, items] of Object.entries(yearlyGroups)) {
      const avgPrice = items.reduce((sum, p) => sum + Number(p.price), 0) / items.length;
      const avgHigh = items.reduce((sum, p) => sum + Number(p.high_price), 0) / items.length;
      const avgLow = items.reduce((sum, p) => sum + Number(p.low_price), 0) / items.length;

      await supabase
        .from('yearly_market_averages')
        .upsert({
          symbol,
          market,
          year: parseInt(year),
          avg_price: Number(avgPrice.toFixed(4)),
          avg_high: Number(avgHigh.toFixed(4)),
          avg_low: Number(avgLow.toFixed(4)),
          data_points: items.length,
        });
    }

    console.log(`📊 Updated yearly averages for ${symbol}:${market}`);
  } catch (error) {
    console.error(`Error updating yearly averages for ${symbol}:${market}:`, error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
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

    console.log('🚀 Starting EPIC market data synchronization...');

    const results = {
      success: [] as string[],
      fallback: [] as string[],
      failed: [] as string[],
      needsBackfill: [] as string[],
    };

    // Fetch current prices for all markets
    const fetchPromises = MARKETS_CONFIG.map(config =>
      fetchMarketPrice(config.symbol, config.market, config.twelveDataSymbol, twelveDataApiKey, supabase)
        .then(data => ({ config, data }))
    );

    const fetchResults = await Promise.all(fetchPromises);
    const validRecords = fetchResults
      .filter(result => result.data !== null)
      .map(result => result.data!);

    // Save current prices to database
    if (validRecords.length > 0) {
      const { error } = await supabase
        .from('market_prices')
        .insert(validRecords);

      if (error) {
        console.error('❌ Error saving prices:', error);
      } else {
        console.log(`✅ Saved ${validRecords.length} price records`);
      }
    }

    // Track results
    for (const result of fetchResults) {
      const key = `${result.config.market}:${result.config.symbol}`;
      if (result.data) {
        results.success.push(key);
      } else {
        results.needsBackfill.push(key);
      }
    }

    // Check for data gaps and backfill if needed
    console.log('🔍 Checking for data gaps...');
    for (const config of MARKETS_CONFIG) {
      const { data: recentData } = await supabase
        .from('market_prices')
        .select('recorded_at')
        .eq('symbol', config.symbol)
        .eq('market', config.market)
        .order('recorded_at', { ascending: false })
        .limit(1);

      const needsBackfill = !recentData || recentData.length === 0;

      if (needsBackfill) {
        console.log(`📥 Backfilling 1 year of data for ${config.market}:${config.symbol}...`);
        
        const historicalData = await fetchHistoricalData(
          config.symbol,
          config.market,
          config.twelveDataSymbol,
          twelveDataApiKey,
          365
        );

        if (historicalData.length > 0) {
          // Insert in batches
          const batchSize = 100;
          for (let i = 0; i < historicalData.length; i += batchSize) {
            const batch = historicalData.slice(i, i + batchSize);
            await supabase.from('market_prices').insert(batch);
          }
          console.log(`✅ Backfilled ${historicalData.length} records for ${config.market}:${config.symbol}`);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update trends
      await updateMonthlyAverages(config.symbol, config.market, supabase);
      await updateYearlyAverages(config.symbol, config.market, supabase);
    }

    console.log('✨ EPIC synchronization completed!');
    console.log(`📊 Stats: ${results.success.length} fresh, ${results.fallback.length} fallback, ${results.needsBackfill.length} backfilled`);

    return new Response(
      JSON.stringify({
        success: true,
        message: '✨ Market data synchronized with epic precision!',
        stats: {
          fresh: results.success.length,
          fallback: results.fallback.length,
          backfilled: results.needsBackfill.length,
          failed: results.failed.length,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('💥 Epic fail:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
