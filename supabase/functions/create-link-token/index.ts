
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Configuration, PlaidApi, PlaidEnvironments } from "https://esm.sh/plaid@15.0.0";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Creating link token for user:", userId);
    
    // Initialize Plaid client
    const configuration = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': '67c19c17f7e3ca0022f7bbb7',
          'PLAID-SECRET': '46ce37a59b27903aa88c135a5adbd7',
        },
      },
    });
    
    const plaidClient = new PlaidApi(configuration);

    // Create link token
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'Fluida Finance',
      products: ['auth', 'transactions'],
      country_codes: ['US', 'CA', 'GB', 'EU'],
      language: 'en',
    });

    console.log("Link token created successfully:", linkTokenResponse.data.link_token);

    return new Response(
      JSON.stringify({ link_token: linkTokenResponse.data.link_token }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error creating link token:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create link token' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
