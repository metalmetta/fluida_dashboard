
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSettingsData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
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
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            throw error;
          }

          if (data) {
            setProfileData({
              fullName: data.full_name || '',
              email: user.email || '',
              phone: '',
              companyName: data.company_name || '',
              taxId: '',
              address: '',
              city: '',
              state: '',
              zip: '',
              avatarUrl: data.avatar_url || ''
            });
          }
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
  }, [user, toast]);

  return { profileData, loading };
}
