
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export function useBusinessDetails(session: Session | null) {
  // Company Details State
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [description, setDescription] = useState("");
  
  // Business Address State
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");

  useEffect(() => {
    if (session?.user) {
      // Load company name from user metadata
      setCompanyName(session.user.user_metadata?.company_name || "");
      
      // Load any saved business details from the database
      loadBusinessDetails();
    }
  }, [session]);

  const loadBusinessDetails = async () => {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase
        .from("business_details")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        // Populate form with saved data
        setCompanyName(data.legal_name || companyName);
        setStreet(data.address_line1 || "");
        setCity(data.city || "");
        setState(data.state || "");
        setPostalCode(data.postal_code || "");
        setCountry(data.country || "United States");
        setTaxId(data.tax_id || "");
      }
    } catch (error) {
      console.error("Error loading business details:", error);
    }
  };

  const saveBusinessDetails = async () => {
    if (!session?.user) return;
    
    try {
      const businessData = {
        user_id: session.user.id,
        legal_name: companyName,
        tax_id: taxId,
        address_line1: street,
        city,
        state,
        postal_code: postalCode,
        country,
        status: "kyb_submitted"
      };
      
      // Check if we already have a record
      const { data, error } = await supabase
        .from("business_details")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (!data) {
        // Record doesn't exist, create new
        await supabase.from("business_details").insert(businessData);
      } else {
        // Record exists, update it
        await supabase
          .from("business_details")
          .update(businessData)
          .eq("user_id", session.user.id);
      }
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          business_status: "kyb_submitted"
        }
      });
    } catch (error) {
      console.error("Error saving business details:", error);
      throw error;
    }
  };

  return {
    // Company details
    companyName, setCompanyName,
    industry, setIndustry,
    website, setWebsite,
    phoneNumber, setPhoneNumber,
    taxId, setTaxId,
    description, setDescription,
    
    // Address details
    street, setStreet,
    city, setCity,
    state, setState,
    postalCode, setPostalCode,
    country, setCountry,
    
    // Functions
    saveBusinessDetails
  };
}
