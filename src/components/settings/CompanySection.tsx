
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanyData {
  companyName: string;
  taxId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface CompanySectionProps {
  profileData: CompanyData;
  setProfileData: React.Dispatch<React.SetStateAction<any>>;
  userId?: string;
}

export function CompanySection({ profileData, setProfileData, userId }: CompanySectionProps) {
  const { toast } = useToast();

  const handleSaveCompany = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: profileData.companyName
        })
        .eq('id', userId);

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
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input 
              id="company-name" 
              placeholder="Company name" 
              value={profileData.companyName}
              onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-id">Tax ID</Label>
            <Input 
              id="tax-id" 
              placeholder="Tax ID number" 
              value={profileData.taxId}
              onChange={(e) => setProfileData({...profileData, taxId: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input 
            id="address" 
            placeholder="Company address" 
            value={profileData.address}
            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input 
              id="city" 
              placeholder="City" 
              value={profileData.city}
              onChange={(e) => setProfileData({...profileData, city: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input 
              id="state" 
              placeholder="State" 
              value={profileData.state}
              onChange={(e) => setProfileData({...profileData, state: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input 
              id="zip" 
              placeholder="ZIP code" 
              value={profileData.zip}
              onChange={(e) => setProfileData({...profileData, zip: e.target.value})}
            />
          </div>
        </div>
      </div>
      <Button onClick={handleSaveCompany}>Save Company Details</Button>
    </div>
  );
}
