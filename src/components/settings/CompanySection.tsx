
import React, { useState } from "react";
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
  const [saving, setSaving] = useState(false);

  const handleSaveCompany = async () => {
    if (!userId) return;
    
    try {
      setSaving(true);
      
      // Update both the legacy and new tables
      await Promise.all([
        // Update the legacy profiles table with just the company name
        supabase
          .from('profiles')
          .update({
            company_name: profileData.companyName
          })
          .eq('id', userId),
          
        // Update or insert into the new company_data table
        supabase
          .from('company_data')
          .upsert({
            user_id: userId,
            company_name: profileData.companyName,
            tax_id: profileData.taxId,
            address: profileData.address,
            city: profileData.city,
            state: profileData.state,
            zip: profileData.zip
          }, { onConflict: 'user_id' })
      ]);

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
    } finally {
      setSaving(false);
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
      <Button onClick={handleSaveCompany} disabled={saving}>
        {saving ? "Saving..." : "Save Company Details"}
      </Button>
    </div>
  );
}
