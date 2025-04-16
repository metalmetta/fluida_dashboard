
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProfileData {
  fullName: string;
  email: string;
  phone: string; // Ensuring this is a string type
  companyName: string;
  taxId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  avatarUrl: string;
}

export function useProfileData(promptProfileCompletion?: boolean) {
  const { user, isNewUser, setIsNewUser } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    taxId: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    avatarUrl: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      try {
        setLoading(true);
        if (user) {
          console.log("Loading profile data for user:", user.id);
          
          // Fetch data from both profiles and company_data tables
          const [profilesResult, companyDataResult] = await Promise.all([
            // Profiles table
            supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single(),
              
            // Company data table  
            supabase
              .from('company_data')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle()
          ]);
          
          console.log("Fetched profile data:", profilesResult);
          console.log("Fetched company data:", companyDataResult);
          
          const baseData = {
            fullName: "",
            email: user.email || "",
            phone: "",
            companyName: "",
            taxId: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            avatarUrl: ""
          };
          
          // Take data from profiles table
          if (profilesResult.data) {
            baseData.fullName = profilesResult.data.full_name || '';
            baseData.companyName = profilesResult.data.company_name || '';
            baseData.avatarUrl = profilesResult.data.avatar_url || '';
            // Convert phone to string if it exists
            baseData.phone = profilesResult.data.phone ? String(profilesResult.data.phone) : '';
          }
          
          // Then add company data if available
          if (companyDataResult.data) {
            baseData.companyName = companyDataResult.data.company_name || baseData.companyName;
            baseData.taxId = companyDataResult.data.tax_id || '';
            baseData.address = companyDataResult.data.address || '';
            baseData.city = companyDataResult.data.city || '';
            baseData.state = companyDataResult.data.state || '';
            baseData.zip = companyDataResult.data.zip || '';
          }
          
          console.log("Setting profile data:", baseData);
          setProfileData(baseData);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast({
          title: "Error loading profile",
          description: "Could not load your profile information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();

    // Check if we need to prompt for profile completion
    if (isNewUser || promptProfileCompletion) {
      toast({
        title: "Complete your profile",
        description: "Please complete your profile information to get started",
      });
      setIsNewUser && setIsNewUser(false); // Reset the flag after showing the prompt
    }
  }, [user, toast, isNewUser, setIsNewUser, promptProfileCompletion]);

  return { profileData, setProfileData, loading, user };
}
