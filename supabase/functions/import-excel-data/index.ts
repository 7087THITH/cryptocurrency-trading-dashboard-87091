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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: excelData } = await req.json();
    
    console.log('Starting data import...');

    const exchangeRates = [];
    const lmePrices = [];
    const shfePrices = [];

    // Parse Excel data
    for (const row of excelData) {
      if (!row.makingDate || !row.dataDate) continue;

      const makingDate = row.makingDate;
      const dataDate = row.dataDate;

      // Exchange rates
      if (row.currency && (row.sellingPrice || row.exchangeRate)) {
        exchangeRates.push({
          making_date: makingDate,
          data_date: dataDate,
          currency: row.currency,
          selling_price: row.sellingPrice || null,
          exchange_rate: row.exchangeRate || null,
        });
      }

      // LME prices
      if (row.metal && row.lmeUsd) {
        lmePrices.push({
          making_date: makingDate,
          data_date: dataDate,
          metal: row.metal,
          price_usd: row.lmeUsd,
        });
      }

      // SHFE prices
      if (row.metal && row.shfeCny) {
        shfePrices.push({
          making_date: makingDate,
          data_date: dataDate,
          metal: row.metal,
          price_cny: row.shfeCny,
          price_usd: row.shfeUsd || null,
        });
      }
    }

    // Insert data in batches
    const batchSize = 1000;

    // Insert exchange rates
    for (let i = 0; i < exchangeRates.length; i += batchSize) {
      const batch = exchangeRates.slice(i, i + batchSize);
      const { error } = await supabase
        .from('historical_exchange_rates')
        .insert(batch);
      if (error) {
        console.error('Error inserting exchange rates:', error);
        throw error;
      }
    }

    // Insert LME prices
    for (let i = 0; i < lmePrices.length; i += batchSize) {
      const batch = lmePrices.slice(i, i + batchSize);
      const { error } = await supabase
        .from('historical_lme_prices')
        .insert(batch);
      if (error) {
        console.error('Error inserting LME prices:', error);
        throw error;
      }
    }

    // Insert SHFE prices
    for (let i = 0; i < shfePrices.length; i += batchSize) {
      const batch = shfePrices.slice(i, i + batchSize);
      const { error } = await supabase
        .from('historical_shfe_prices')
        .insert(batch);
      if (error) {
        console.error('Error inserting SHFE prices:', error);
        throw error;
      }
    }

    console.log(`Successfully imported ${exchangeRates.length} exchange rates, ${lmePrices.length} LME prices, ${shfePrices.length} SHFE prices`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data imported successfully',
        counts: {
          exchangeRates: exchangeRates.length,
          lmePrices: lmePrices.length,
          shfePrices: shfePrices.length,
        }
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
