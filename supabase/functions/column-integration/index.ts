
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const COLUMN_API_KEY = Deno.env.get("COLUMN_API_KEY") || "";
const COLUMN_BASE_URL = "https://api.column.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { businessDetails, userId } = await req.json();

    console.log("Received request with business details:", JSON.stringify(businessDetails));
    console.log("User ID:", userId);

    // Create business entity in Column
    const entityResponse = await createBusinessEntity(businessDetails);
    
    if (!entityResponse.ok) {
      const errorData = await entityResponse.json();
      console.error("Failed to create business entity:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to create business entity", details: errorData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const entityData = await entityResponse.json();
    console.log("Created business entity:", entityData);

    // Create bank account for the business
    const bankAccountResponse = await createBankAccount(entityData.id);
    
    if (!bankAccountResponse.ok) {
      const errorData = await bankAccountResponse.json();
      console.error("Failed to create bank account:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to create bank account", details: errorData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const bankAccountData = await bankAccountResponse.json();
    console.log("Created bank account:", bankAccountData);

    // Update the business_details record with Column information
    if (userId) {
      try {
        const { error } = await supabase
          .from('business_details')
          .update({
            column_entity_id: entityData.id,
            status: 'approved',
            submitted_at: new Date().toISOString(),
            reviewed_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          console.error("Error updating business_details:", error);
        } else {
          console.log("Updated business_details with Column entity info");
        }
      } catch (dbError) {
        console.error("Failed to update business_details:", dbError);
      }
    }

    // Return the combined data
    return new Response(
      JSON.stringify({ 
        entity: entityData,
        bankAccount: bankAccountData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in column-integration function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function createBusinessEntity(businessDetails) {
  const entityData = {
    type: "business",
    name: businessDetails.companyName,
    business: {
      address: {
        street: businessDetails.street,
        city: businessDetails.city,
        state: businessDetails.state,
        postalCode: businessDetails.postalCode,
        country: businessDetails.country || "US"
      },
      structure: "corporation",
      phone: businessDetails.phone || "5555555555", // Default placeholder if not provided
      email: businessDetails.email,
      taxId: businessDetails.taxId || "000000000", // Default placeholder if not provided
    }
  };

  console.log("Sending entity creation request to Column:", JSON.stringify(entityData));

  return fetch(`${COLUMN_BASE_URL}/entities/business`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${COLUMN_API_KEY}`
    },
    body: JSON.stringify(entityData)
  });
}

async function createBankAccount(entityId) {
  const bankAccountData = {
    entityId: entityId,
    name: "Business Account"
  };

  console.log("Sending bank account creation request to Column:", JSON.stringify(bankAccountData));

  return fetch(`${COLUMN_BASE_URL}/bank-accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${COLUMN_API_KEY}`
    },
    body: JSON.stringify(bankAccountData)
  });
}
