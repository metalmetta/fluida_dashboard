
// Import Plaid from a CDN URL that works with Deno
import { Configuration, PlaidApi, PlaidEnvironments } from 'https://esm.sh/plaid@18.2.0';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Exchange Public Token function loaded");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for CORS preflight');
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log('Received request for exchange-public-token');
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const { publicToken, userId } = await req.json();
    if (!publicToken || !userId) {
      console.error('Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Exchanging public token for user: ${userId}`);

    // Configure Plaid
    const plaidClientId = Deno.env.get('PLAID_CLIENT_ID');
    const plaidSecret = Deno.env.get('PLAID_SECRET');
    const plaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox';

    if (!plaidClientId || !plaidSecret) {
      console.error('Missing Plaid API credentials');
      return new Response(
        JSON.stringify({ error: 'Plaid API credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Initialize Plaid client
    const configuration = new Configuration({
      basePath: PlaidEnvironments[plaidEnv],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': plaidClientId,
          'PLAID-SECRET': plaidSecret,
        },
      },
    });
    const plaidClient = new PlaidApi(configuration);

    // Exchange public token for access token
    console.log('Exchanging public token for access token...');
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;
    console.log('Successfully exchanged public token');

    // Get account information
    console.log('Fetching account information...');
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    const accounts = accountsResponse.data.accounts;
    console.log(`Retrieved ${accounts.length} accounts`);

    // Return the access token and account info to the client
    return new Response(
      JSON.stringify({ 
        access_token: accessToken,
        item_id: itemId,
        accounts: accounts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in exchange-public-token:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to exchange public token',
        details: error.response?.data || error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
