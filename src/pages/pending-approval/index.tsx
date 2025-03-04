
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { Check } from "lucide-react";

interface BusinessDetails {
  legal_name: string;
  submitted_at: string | null;
}

export default function PendingApproval() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      if (!session?.user) return;
      
      try {
        const { data, error } = await supabase
          .from('business_details')
          .select('legal_name, submitted_at')
          .eq('user_id', session.user.id)
          .single();
          
        if (error) throw error;
        
        setBusinessDetails(data);
      } catch (error) {
        console.error("Error fetching business details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBusinessDetails();
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("You have been signed out");
    navigate("/auth");
  };

  // For demo purposes only - in a real app this would be handled by an admin
  const handleApproveDemo = async () => {
    try {
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          business_status: "approved",
          kyb_approved_at: new Date().toISOString(),
        },
      });

      if (authError) throw authError;

      // Update business_details table
      if (session?.user) {
        const { error: dbError } = await supabase
          .from('business_details')
          .update({ 
            status: 'approved',
            reviewed_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);

        if (dbError) throw dbError;
      }

      toast.success("Business verified! Redirecting to dashboard...");
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verification Pending</CardTitle>
          <CardDescription>
            Your business information is being reviewed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {businessDetails && (
            <div className="bg-white border rounded-md p-4">
              <h3 className="font-medium">{businessDetails.legal_name}</h3>
              {businessDetails.submitted_at && (
                <p className="text-sm text-gray-500 mt-1">
                  Submitted on {new Date(businessDetails.submitted_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="font-medium text-yellow-800">Under Review</h3>
            <p className="text-yellow-700 mt-1">
              Thank you for submitting your KYB documents. Our team is currently
              reviewing your information. This process typically takes 1-3
              business days.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Verification Steps</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Documents Submitted</p>
                  <p className="text-sm text-gray-500">Your documents have been received</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-yellow-100 p-1 mr-2 mt-0.5">
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                </div>
                <div>
                  <p className="font-medium">Compliance Review</p>
                  <p className="text-sm text-gray-500">Our team is reviewing your documents</p>
                </div>
              </li>
              <li className="flex items-start opacity-50">
                <div className="rounded-full bg-gray-100 p-1 mr-2 mt-0.5">
                  <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                </div>
                <div>
                  <p className="font-medium">Account Activation</p>
                  <p className="text-sm text-gray-500">Once approved, your account will be activated</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="border-t pt-4 space-y-4">
            <p className="text-sm text-gray-500">
              Questions? Contact our support team at support@example.com
            </p>
            <div className="flex flex-col space-y-2">
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
              
              {/* FOR DEMO PURPOSES ONLY - In a real app, this would be handled by an admin */}
              <div className="mt-4 p-2 border border-gray-200 rounded-md bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">Demo Mode:</p>
                <Button 
                  onClick={handleApproveDemo} 
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  Simulate Approval (Demo Only)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
