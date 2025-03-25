
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, CheckSquare, Users, CreditCard, Wallet } from "lucide-react";
import ProfileSettings from "./ProfileSettings";
import CompanySettings from "./CompanySettings";
import ApprovalSettings from "./ApprovalSettings";
import TeamSettings from "./TeamSettings";
import BillingSettings from "./BillingSettings";
import PaymentMethods from "./PaymentMethods";

export default function SettingsTabs() {
  return (
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
        <ProfileSettings />
      </TabsContent>

      <TabsContent value="company">
        <CompanySettings />
      </TabsContent>

      <TabsContent value="payment-methods">
        <PaymentMethods />
      </TabsContent>

      <TabsContent value="approvals">
        <ApprovalSettings />
      </TabsContent>

      <TabsContent value="team">
        <TeamSettings />
      </TabsContent>

      <TabsContent value="billing">
        <BillingSettings />
      </TabsContent>
    </Tabs>
  );
}
