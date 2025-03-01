
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
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log(`Creating link token for user: ${userId}`);

    // Create a link token with Plaid API
    const createTokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'Fluida Finance App',
      products: ['auth', 'transactions'],
      country_codes: ['US', 'CA', 'GB', 'EU'],
      language: 'en',
    });

    console.log("Link token created successfully");
    console.log(`Link token: ${createTokenResponse.data.link_token.slice(0, 10)}...`);

    // Return the link token to the client
    return new Response(
      JSON.stringify({ link_token: createTokenResponse.data.link_token }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating link token:', error);
    
    // Return error response with more details
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create link token',
        details: error.response?.data || {}
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
