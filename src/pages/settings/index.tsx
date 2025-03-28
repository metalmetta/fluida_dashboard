import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, CheckSquare, Users, CreditCard, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentMethods from "@/components/settings/PaymentMethods";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { CompanySection } from "@/components/settings/CompanySection";
import { ApprovalSettings } from "@/components/settings/ApprovalSettings";
import { TeamSection } from "@/components/settings/TeamSection";
import { BillingSection } from "@/components/settings/BillingSection";
import { useLocation, useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, isNewUser, setIsNewUser } = useAuth();
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
  const [activeTab, setActiveTab] = useState<string>("profile");
  const location = useLocation();
  const navigate = useNavigate();

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
          
          console.log("Fetched data:", {
            profilesResult,
            companyDataResult
          });
          
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
            baseData.phone = profilesResult.data.phone || '';
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
    if (isNewUser || location.state?.promptProfileCompletion) {
      setActiveTab("profile");
      toast({
        title: "Complete your profile",
        description: "Please complete your profile information to get started",
      });
      setIsNewUser(false); // Reset the flag after showing the prompt
    }
  }, [user, toast, isNewUser, setIsNewUser, location.state]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // If this is a new user being guided through setup, show company prompt after profile
    if (isNewUser && value === "company") {
      toast({
        title: "Company Information",
        description: "Now, let's add your company details",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="payment-methods" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Approvals
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Loading profile data...</p>
                </div>
              ) : (
                <ProfileSection 
                  profileData={profileData} 
                  setProfileData={setProfileData} 
                  userId={user?.id} 
                />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Loading company data...</p>
                </div>
              ) : (
                <CompanySection 
                  profileData={profileData} 
                  setProfileData={setProfileData} 
                  userId={user?.id} 
                />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="payment-methods">
            <Card className="p-6">
              <PaymentMethods />
            </Card>
          </TabsContent>

          <TabsContent value="approvals">
            <Card className="p-6">
              <ApprovalSettings />
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card className="p-6">
              <TeamSection />
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="p-6">
              <BillingSection />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
