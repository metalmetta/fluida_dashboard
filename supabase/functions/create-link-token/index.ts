
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Configuration, PlaidApi, PlaidEnvironments } from "https://esm.sh/plaid@18.1.0";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
    
    // Return error response
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
