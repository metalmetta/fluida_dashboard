
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Create Link Token function loaded");

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
    console.log('Received request for create-link-token');
    
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
    const { userId } = await req.json();
    if (!userId) {
      console.error('No user ID provided in request body');
      return new Response(
        JSON.stringify({ error: 'No user ID provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Creating link token for user: ${userId}`);

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

    // Create link token request
    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Fluida Finance App',
      products: ['auth', 'transactions'],
      language: 'en',
      country_codes: ['US', 'CA', 'GB', 'EU'],
    };

    console.log('Calling Plaid API to create link token...');
    // Create link token with Plaid
    const createTokenResponse = await plaidClient.linkTokenCreate(request);
    console.log('Successfully created link token');

    // Return the link token to the client
    return new Response(
      JSON.stringify({ link_token: createTokenResponse.data.link_token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in create-link-token:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create link token',
        details: error.response?.data || error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
