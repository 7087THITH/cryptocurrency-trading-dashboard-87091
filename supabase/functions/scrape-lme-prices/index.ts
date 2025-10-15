import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LMEPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting LME price scraping...');

    // Fetch LME website
    const response = await fetch('https://www.lme.com/en/market-data/real-time-prices', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LME data: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Successfully fetched LME website');

    // Parse the HTML to extract metal prices
    // Note: This is a simplified parser - you may need to adjust based on actual HTML structure
    const metals: LMEPrice[] = [];
    
    // Common LME metals with their patterns
    const metalPatterns = [
      { symbol: 'CU', name: 'Copper', pattern: /copper/i },
      { symbol: 'AL', name: 'Aluminium', pattern: /aluminium/i },
      { symbol: 'ZN', name: 'Zinc', pattern: /zinc/i },
      { symbol: 'PB', name: 'Lead', pattern: /lead/i },
      { symbol: 'NI', name: 'Nickel', pattern: /nickel/i },
      { symbol: 'SN', name: 'Tin', pattern: /tin/i },
    ];

    // Try to extract prices from the HTML
    // This is a basic implementation - you may need to adjust based on the actual structure
    for (const metal of metalPatterns) {
      // Look for price patterns near metal names
      const priceRegex = new RegExp(`${metal.pattern.source}[\\s\\S]{0,500}?(\\d+[,.]?\\d*)`, 'i');
      const match = html.match(priceRegex);
      
      if (match) {
        const price = parseFloat(match[1].replace(',', ''));
        metals.push({
          symbol: metal.symbol,
          name: metal.name,
          price: price,
          change: 0, // Would need additional parsing for actual change values
          timestamp: new Date().toISOString(),
        });
        console.log(`Found ${metal.name}: $${price}`);
      }
    }

    if (metals.length === 0) {
      console.warn('No metal prices found in HTML');
      // Return mock data for testing
      return new Response(
        JSON.stringify({
          success: true,
          data: [
            { symbol: 'CU', name: 'Copper', price: 8245, change: 1.2, timestamp: new Date().toISOString() },
            { symbol: 'AL', name: 'Aluminium', price: 2156, change: -0.5, timestamp: new Date().toISOString() },
            { symbol: 'ZN', name: 'Zinc', price: 2589, change: 0.7, timestamp: new Date().toISOString() },
            { symbol: 'PB', name: 'Lead', price: 2045, change: -0.3, timestamp: new Date().toISOString() },
            { symbol: 'NI', name: 'Nickel', price: 16850, change: 1.8, timestamp: new Date().toISOString() },
            { symbol: 'SN', name: 'Tin', price: 25680, change: 0.9, timestamp: new Date().toISOString() },
          ],
          message: 'Using mock data - HTML parsing needs adjustment',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: metals,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error scraping LME prices:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
