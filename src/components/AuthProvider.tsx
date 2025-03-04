
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  businessStatus: string | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  businessStatus: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [businessStatus, setBusinessStatus] = useState<string | null>(null);

  const fetchBusinessStatus = async (userId: string) => {
    try {
      // First check user metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.business_status) {
        return user.user_metadata.business_status;
      }
      
      // Then check business_details table if exists
      const { data, error } = await supabase
        .from('business_details')
        .select('status')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
          console.error("Error fetching business status:", error);
        }
        return null;
      }
      
      return data?.status || null;
    } catch (error) {
      console.error("Error fetching business status:", error);
      return null;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const status = await fetchBusinessStatus(session.user.id);
        setBusinessStatus(status);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const status = await fetchBusinessStatus(session.user.id);
        setBusinessStatus(status);
      } else {
        setBusinessStatus(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, businessStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
