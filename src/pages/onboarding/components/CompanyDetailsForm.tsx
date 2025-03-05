
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CompanyDetailsFormProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  taxId: string;
  setTaxId: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}

export function CompanyDetailsForm({
  companyName,
  setCompanyName,
  industry,
  setIndustry,
  website,
  setWebsite,
  phoneNumber,
  setPhoneNumber,
  taxId,
  setTaxId,
  description,
  setDescription,
}: CompanyDetailsFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Company Details</h2>
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="taxId">Tax ID / EIN</Label>
        <Input
          id="taxId"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Business Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
