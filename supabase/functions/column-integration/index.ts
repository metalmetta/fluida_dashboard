
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const COLUMN_API_KEY = Deno.env.get("COLUMN_API_KEY") || "";
const COLUMN_BASE_URL = "https://api.column.com";

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
    const { businessDetails, userId } = await req.json();

    console.log("Received request with business details:", JSON.stringify(businessDetails));

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
