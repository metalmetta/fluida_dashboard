
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CompanySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyData, setCompanyData] = useState({
    companyName: "",
    taxId: "",
    address: "",
    city: "",
    state: "",
    zip: ""
  });

  const handleSaveCompany = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: companyData.companyName
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Company Details Updated",
        description: "Your company information has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating company details:', error);
      toast({
        title: "Error",
        description: "Failed to update company details",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                placeholder="Company name" 
                value={companyData.companyName}
                onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-id">Tax ID</Label>
              <Input 
                id="tax-id" 
                placeholder="Tax ID number" 
                value={companyData.taxId}
                onChange={(e) => setCompanyData({...companyData, taxId: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address" 
              placeholder="Company address" 
              value={companyData.address}
              onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                placeholder="City" 
                value={companyData.city}
                onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input 
                id="state" 
                placeholder="State" 
                value={companyData.state}
                onChange={(e) => setCompanyData({...companyData, state: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input 
                id="zip" 
                placeholder="ZIP code" 
                value={companyData.zip}
                onChange={(e) => setCompanyData({...companyData, zip: e.target.value})}
              />
            </div>
          </div>
        </div>
        <Button onClick={handleSaveCompany}>Save Company Details</Button>
      </div>
    </Card>
  );
}
