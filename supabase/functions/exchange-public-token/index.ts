
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Configuration, PlaidApi, PlaidEnvironments } from "https://esm.sh/plaid@18.1.0";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Supabase client with service role to access database
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Plaid client
// In a production environment, you should store these values in Supabase secrets
const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID") || "your_client_id";
const PLAID_SECRET = Deno.env.get("PLAID_SECRET") || "your_secret";
const PLAID_ENV = Deno.env.get("PLAID_ENV") || "sandbox";

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

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
    // Extract request data
    const { publicToken, userId } = await req.json();
    
    if (!publicToken || !userId) {
      throw new Error('Public token and User ID are required');
    }

    console.log(`Exchanging public token for user: ${userId}`);

    // Exchange the public token for an access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    console.log("Public token exchanged successfully for access token");

    // Get account info for the new item
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;
    console.log(`Retrieved ${accounts.length} accounts`);

    return new Response(
      JSON.stringify({ 
        access_token: accessToken,
        item_id: itemId,
        accounts: accounts 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error exchanging public token:', error);
    
    // Return error response
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
