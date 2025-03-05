
import { supabase } from "@/integrations/supabase/client";
import { BusinessDetails } from "@/types/column.types";

export async function createColumnEntityAndAccount(userId: string, columnBusinessDetails: BusinessDetails) {
  try {
    // Call our edge function to create Column entity and bank account
    const response = await supabase.functions.invoke("column-integration", {
      body: { businessDetails: columnBusinessDetails, userId }
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to create Column entity");
    }

    const { data } = response;

    // Mark business as approved
    await supabase
      .from("business_details")
      .update({
        status: "approved"
      })
      .eq("user_id", userId);

    return data;
  } catch (error) {
    console.error("Error creating Column entity and account:", error);
    throw error;
  }
}
