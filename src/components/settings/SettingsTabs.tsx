
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Building2, CheckSquare, CreditCard, User, Users, Wallet } from "lucide-react";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { CompanySection } from "@/components/settings/CompanySection";
import PaymentMethods from "@/components/settings/PaymentMethods";
import { ApprovalSettings } from "@/components/settings/ApprovalSettings";
import { TeamSection } from "@/components/settings/TeamSection";
import { BillingSection } from "@/components/settings/BillingSection";
import { ProfileData } from "@/hooks/useProfileData";

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  loading: boolean;
  userId?: string;
}

export function SettingsTabs({ 
  activeTab, 
  onTabChange, 
  profileData, 
  setProfileData, 
  loading, 
  userId 
}: SettingsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
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
              userId={userId} 
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
              userId={userId} 
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
  );
}
