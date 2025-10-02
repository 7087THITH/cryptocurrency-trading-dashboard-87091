import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schemas
const ExcelRowSchema = z.object({
  makingDate: z.string().optional(),
  dataDate: z.string().optional(),
  currency: z.string().optional(),
  sellingPrice: z.number().positive().optional(),
  exchangeRate: z.number().positive().optional(),
  metal: z.string().optional(),
  lmeUsd: z.number().positive().optional(),
  shfeCny: z.number().positive().optional(),
  shfeUsd: z.number().positive().optional(),
});

const RequestSchema = z.object({
  data: z.array(ExcelRowSchema).max(10000), // Max 10k rows
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      throw new Error('Unauthorized: Invalid or missing authentication');
    }

    // Check if user has admin role
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roles) {
      console.error('Authorization error:', roleError);
      throw new Error('Forbidden: Admin access required');
    }

    console.log(`Admin user ${user.email} initiating data import...`);

    // Parse and validate request body
    const body = await req.json();
    const validationResult = RequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      throw new Error(`Invalid data format: ${validationResult.error.message}`);
    }

    const validatedData = validationResult.data;
    const excelData = validatedData.data; // Get the array from the data property
    
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

    // Use service role key for inserts (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Insert data in batches
    const batchSize = 1000;

    // Insert exchange rates
    for (let i = 0; i < exchangeRates.length; i += batchSize) {
      const batch = exchangeRates.slice(i, i + batchSize);
      const { error } = await supabaseAdmin
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
      const { error } = await supabaseAdmin
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
      const { error } = await supabaseAdmin
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
