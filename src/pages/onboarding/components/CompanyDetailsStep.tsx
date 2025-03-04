
import { BusinessDetails } from "@/hooks/use-kyb";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CompanyDetailsStepProps {
  formData: BusinessDetails;
  handleInputChange: (field: keyof BusinessDetails, value: string) => void;
}

export default function CompanyDetailsStep({
  formData,
  handleInputChange,
}: CompanyDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="legal_name">Legal Company Name</Label>
        <Input
          id="legal_name"
          value={formData.legal_name}
          onChange={(e) => handleInputChange("legal_name", e.target.value)}
          placeholder="e.g. Acme Corporation"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="registration_number">Business Registration Number</Label>
        <Input
          id="registration_number"
          value={formData.registration_number}
          onChange={(e) => handleInputChange("registration_number", e.target.value)}
          placeholder="e.g. 12345678"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tax_id">Tax ID Number</Label>
        <Input
          id="tax_id"
          value={formData.tax_id}
          onChange={(e) => handleInputChange("tax_id", e.target.value)}
          placeholder="e.g. ABC-123-456"
          required
        />
      </div>
    </div>
  );
}
