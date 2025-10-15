import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
    if (!apiKey) {
      throw new Error('TWELVE_DATA_API_KEY not configured');
    }

    console.log('Starting historical data fetch from 2021...');

    // FX pairs to fetch
    const fxPairs = [
      { symbol: 'USD/THB', interval: '1day' },
      { symbol: 'THB/JPY', interval: '1day' },
      { symbol: 'THB/CNY', interval: '1day' },
      { symbol: 'USD/CNY', interval: '1day' }
    ];

    // Metals to fetch (using different API endpoints)
    const metals = ['CU', 'AL', 'ZN'];
    
    let totalRecords = 0;
    const startDate = '2021-01-01';
    const endDate = new Date().toISOString().split('T')[0];

    // Fetch FX data
    for (const pair of fxPairs) {
      console.log(`Fetching ${pair.symbol} data...`);
      
      const url = `https://api.twelvedata.com/time_series?symbol=${pair.symbol}&interval=${pair.interval}&start_date=${startDate}&end_date=${endDate}&apikey=${apiKey}&outputsize=5000`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'error') {
        console.error(`Error fetching ${pair.symbol}:`, data.message);
        continue;
      }

      if (data.values && data.values.length > 0) {
        // Calculate monthly averages
        const monthlyData = calculateMonthlyAverages(data.values, pair.symbol, 'FX');
        
        // Insert monthly averages
        for (const monthData of monthlyData) {
          const { error } = await supabaseClient
            .from('monthly_market_averages')
            .upsert({
              symbol: monthData.symbol,
              market: monthData.market,
              year: monthData.year,
              month: monthData.month,
              avg_price: monthData.avg_price,
              avg_high: monthData.avg_high,
              avg_low: monthData.avg_low,
              data_points: monthData.data_points
            }, {
              onConflict: 'symbol,market,year,month'
            });

          if (error) {
            console.error('Error inserting monthly data:', error);
          } else {
            totalRecords++;
          }
        }

        // Calculate yearly averages
        const yearlyData = calculateYearlyAverages(data.values, pair.symbol, 'FX');
        
        // Insert yearly averages
        for (const yearData of yearlyData) {
          const { error } = await supabaseClient
            .from('yearly_market_averages')
            .upsert({
              symbol: yearData.symbol,
              market: yearData.market,
              year: yearData.year,
              avg_price: yearData.avg_price,
              avg_high: yearData.avg_high,
              avg_low: yearData.avg_low,
              data_points: yearData.data_points
            }, {
              onConflict: 'symbol,market,year'
            });

          if (error) {
            console.error('Error inserting yearly data:', error);
          }
        }

        console.log(`Processed ${pair.symbol}: ${data.values.length} records`);
      }
    }

    // Fetch LME metals data (simplified - you may need different API endpoints)
    for (const metal of metals) {
      console.log(`Fetching ${metal} LME data...`);
      
      // Note: This is a placeholder. You may need specific endpoints for LME data
      const url = `https://api.twelvedata.com/time_series?symbol=${metal}&interval=1day&start_date=${startDate}&end_date=${endDate}&apikey=${apiKey}&outputsize=5000`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'error' && data.values && data.values.length > 0) {
        // Process LME data
        const monthlyData = calculateMonthlyAverages(data.values, metal, 'LME');
        
        for (const monthData of monthlyData) {
          await supabaseClient
            .from('monthly_market_averages')
            .upsert({
              symbol: monthData.symbol,
              market: monthData.market,
              year: monthData.year,
              month: monthData.month,
              avg_price: monthData.avg_price,
              avg_high: monthData.avg_high,
              avg_low: monthData.avg_low,
              data_points: monthData.data_points
            }, {
              onConflict: 'symbol,market,year,month'
            });
          
          totalRecords++;
        }

        const yearlyData = calculateYearlyAverages(data.values, metal, 'LME');
        
        for (const yearData of yearlyData) {
          await supabaseClient
            .from('yearly_market_averages')
            .upsert({
              symbol: yearData.symbol,
              market: yearData.market,
              year: yearData.year,
              avg_price: yearData.avg_price,
              avg_high: yearData.avg_high,
              avg_low: yearData.avg_low,
              data_points: yearData.data_points
            }, {
              onConflict: 'symbol,market,year'
            });
        }

        console.log(`Processed ${metal} LME: ${data.values.length} records`);
      }
    }

    console.log(`Historical data fetch completed. Total records: ${totalRecords}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed historical data. Total records: ${totalRecords}`,
        totalRecords 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in fetch-historical-data:', error); // Log detailed error server-side only
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch historical data',
        code: 'FETCH_ERROR'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function calculateMonthlyAverages(values: any[], symbol: string, market: string) {
  const monthlyGroups: { [key: string]: any[] } = {};

  // Group by year-month
  values.forEach(item => {
    const date = new Date(item.datetime);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyGroups[yearMonth]) {
      monthlyGroups[yearMonth] = [];
    }
    monthlyGroups[yearMonth].push(item);
  });

  // Calculate averages for each month
  return Object.entries(monthlyGroups).map(([yearMonth, items]) => {
    const [year, month] = yearMonth.split('-').map(Number);
    
    const prices = items.map(i => parseFloat(i.close));
    const highs = items.map(i => parseFloat(i.high));
    const lows = items.map(i => parseFloat(i.low));

    return {
      symbol,
      market,
      year,
      month,
      avg_price: prices.reduce((a, b) => a + b, 0) / prices.length,
      avg_high: highs.reduce((a, b) => a + b, 0) / highs.length,
      avg_low: lows.reduce((a, b) => a + b, 0) / lows.length,
      data_points: items.length
    };
  });
}

function calculateYearlyAverages(values: any[], symbol: string, market: string) {
  const yearlyGroups: { [key: number]: any[] } = {};

  // Group by year
  values.forEach(item => {
    const year = new Date(item.datetime).getFullYear();
    
    if (!yearlyGroups[year]) {
      yearlyGroups[year] = [];
    }
    yearlyGroups[year].push(item);
  });

  // Calculate averages for each year
  return Object.entries(yearlyGroups).map(([year, items]) => {
    const prices = items.map(i => parseFloat(i.close));
    const highs = items.map(i => parseFloat(i.high));
    const lows = items.map(i => parseFloat(i.low));

    return {
      symbol,
      market,
      year: parseInt(year),
      avg_price: prices.reduce((a, b) => a + b, 0) / prices.length,
      avg_high: highs.reduce((a, b) => a + b, 0) / highs.length,
      avg_low: lows.reduce((a, b) => a + b, 0) / lows.length,
      data_points: items.length
    };
  });
}
