
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

export default function Settings() {
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
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
              <ProfileSection 
                profileData={profileData} 
                setProfileData={setProfileData} 
                userId={user?.id} 
              />
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card className="p-6">
              <CompanySection 
                profileData={profileData} 
                setProfileData={setProfileData} 
                userId={user?.id} 
              />
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
