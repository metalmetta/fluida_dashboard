
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function PendingApproval() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("You have been signed out");
    navigate("/auth");
  };

  // For demo purposes only - in a real app this would be handled by an admin
  const handleApproveDemo = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          business_status: "approved",
          kyb_approved_at: new Date().toISOString(),
        },
      });

      if (error) throw error;

      toast.success("Business verified! Redirecting to dashboard...");
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

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
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="font-medium text-yellow-800">Under Review</h3>
            <p className="text-yellow-700 mt-1">
              Thank you for submitting your KYB documents. Our team is currently
              reviewing your information. This process typically takes 1-3
              business days.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">What happens next?</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Our compliance team reviews your documents</li>
              <li>You may be contacted for additional information</li>
              <li>Once approved, you'll receive access to the full platform</li>
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
