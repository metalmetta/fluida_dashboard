import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BusinessDetails {
  kyb_status: string;
}

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();

  const { data: businessDetails, isLoading } = useQuery<BusinessDetails>({
    queryKey: ['businessDetails', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data, error } = await supabase
        .from('business_details')
        .select('kyb_status')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching business details:', error);
        return null;
      }

      return data;
    },
    enabled: !!session?.user?.id
  });

  if (!session) {
    return <Navigate to="/auth" />;
  }

  // If we're loading, we could show a loading spinner
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If no business details found or KYB status is pending, redirect to appropriate page
  if (!businessDetails) {
    return <Navigate to="/onboarding" />;
  }

  if (businessDetails.kyb_status === 'PENDING') {
    return <Navigate to="/pending-approval" />;
  }

  // If KYB is passed, allow access to the protected route
  return <>{children}</>;
};
