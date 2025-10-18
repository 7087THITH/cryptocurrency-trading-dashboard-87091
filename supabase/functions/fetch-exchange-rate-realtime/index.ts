import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest";

interface ExchangeRateResponse {
  base: string;
  date: string;
  time_last_updated: number;
  rates: Record<string, number>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { base = "USD", target } = await req.json();
    
    console.log(`Fetching exchange rate for ${base}...`);
    
    // Fetch from Exchange Rate API
    const response = await fetch(`${EXCHANGE_RATE_API}/${base}`);
    
    if (!response.ok) {
      throw new Error(`Exchange Rate API error: ${response.statusText}`);
    }
    
    const data: ExchangeRateResponse = await response.json();
    
    // If target currency specified, return only that rate
    if (target && data.rates[target]) {
      return new Response(
        JSON.stringify({
          base: data.base,
          target: target,
          rate: data.rates[target],
          timestamp: new Date(data.time_last_updated * 1000).toISOString(),
          source: "exchangerate-api.com",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Return all rates for the base currency
    const formattedRates = Object.entries(data.rates).map(([currency, rate]) => ({
      base: data.base,
      target: currency,
      rate: rate,
      timestamp: new Date(data.time_last_updated * 1000).toISOString(),
      source: "exchangerate-api.com",
    }));
    
    return new Response(
      JSON.stringify({
        base: data.base,
        rates: formattedRates,
        timestamp: new Date(data.time_last_updated * 1000).toISOString(),
        source: "exchangerate-api.com",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error fetching exchange rate:", err);
    const message = (err as Error)?.message || "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: message,
        source: "exchangerate-api.com",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
