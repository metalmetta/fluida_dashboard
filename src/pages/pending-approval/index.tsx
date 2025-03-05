import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BusinessDetails {
  legal_name: string;
  kyb_status: string;
  kyb_submitted_at: string;
}

export default function PendingApproval() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: businessDetails, isLoading } = useQuery<BusinessDetails>({
    queryKey: ['businessDetails', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data, error } = await supabase
        .from('business_details')
        .select('legal_name, kyb_status, kyb_submitted_at')
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!businessDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Could not find your business details. Please try logging in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 app-gradient-bg">
      <Card className="w-full max-w-lg animate-in slide-in">
        <CardHeader>
          <div className="flex items-center gap-4">
            {businessDetails.kyb_status === 'PENDING' ? (
              <Clock className="h-8 w-8 text-yellow-500" />
            ) : businessDetails.kyb_status === 'PASSED' ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <CardTitle>KYB Verification in Progress</CardTitle>
              <CardDescription>
                We're reviewing your business details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Business Name</h3>
              <p className="text-muted-foreground">{businessDetails.legal_name}</p>
            </div>
            <div>
              <h3 className="font-medium">Submission Date</h3>
              <p className="text-muted-foreground">
                {new Date(businessDetails.kyb_submitted_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block h-2 w-2 rounded-full ${
                  businessDetails.kyb_status === 'PENDING' 
                    ? 'bg-yellow-500' 
                    : businessDetails.kyb_status === 'PASSED'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`} />
                <span className="text-muted-foreground">
                  {businessDetails.kyb_status === 'PENDING' 
                    ? 'Under Review' 
                    : businessDetails.kyb_status === 'PASSED'
                    ? 'Approved'
                    : 'Failed'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Our team is currently reviewing your business details. This process typically takes 1-2 business days. 
              We'll notify you via email once the review is complete.
            </p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Check Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
