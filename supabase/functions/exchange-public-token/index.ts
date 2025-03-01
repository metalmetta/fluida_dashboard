
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, PlaidApi, PlaidEnvironments } from "https://esm.sh/plaid@18.1.0";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Verify request method
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get environment variables
    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET");
    const PLAID_ENV = Deno.env.get("PLAID_ENV") || "sandbox";

    // Validate environment variables
    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      console.error("Missing Plaid API credentials in environment variables");
      throw new Error("Plaid API credentials not configured. Please set PLAID_CLIENT_ID and PLAID_SECRET in Supabase Edge Function secrets.");
    }

    console.log(`Using Plaid environment: ${PLAID_ENV}`);
    console.log(`Client ID exists: ${!!PLAID_CLIENT_ID}`);
    console.log(`Secret exists: ${!!PLAID_SECRET}`);

    // Initialize Plaid client
    const configuration = new Configuration({
      basePath: PlaidEnvironments[PLAID_ENV as keyof typeof PlaidEnvironments],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
          'PLAID-SECRET': PLAID_SECRET,
        },
      },
    });

    const plaidClient = new PlaidApi(configuration);

    // Extract request data
    const { publicToken, userId } = await req.json();
    
    if (!publicToken || !userId) {
      throw new Error('Public token and user ID are required');
    }

    console.log(`Exchanging public token for user: ${userId}`);

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken
    });

    const accessToken = exchangeResponse.data.access_token;
    console.log(`Access token obtained: ${accessToken.slice(0, 5)}...`);

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken
    });

    const accounts = accountsResponse.data.accounts;
    console.log(`Retrieved ${accounts.length} accounts`);

    // Return the access token and accounts to the client
    return new Response(
      JSON.stringify({ 
        access_token: accessToken,
        accounts: accounts 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error exchanging public token:', error);
    
    // Return error response with more details
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to exchange public token',
        details: error.response?.data || {}
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
