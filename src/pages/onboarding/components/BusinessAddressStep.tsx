
import { BusinessDetails } from "@/hooks/use-kyb";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessAddressStepProps {
  formData: BusinessDetails;
  handleInputChange: (field: keyof BusinessDetails, value: string) => void;
}

export default function BusinessAddressStep({
  formData,
  handleInputChange,
}: BusinessAddressStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address_line1">Address Line 1</Label>
        <Input
          id="address_line1"
          value={formData.address_line1}
          onChange={(e) => handleInputChange("address_line1", e.target.value)}
          placeholder="e.g. 123 Business Road"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => handleInputChange("city", e.target.value)}
          placeholder="e.g. New York"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="postal_code">Postal Code</Label>
        <Input
          id="postal_code"
          value={formData.postal_code}
          onChange={(e) => handleInputChange("postal_code", e.target.value)}
          placeholder="e.g. 10001"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select 
          value={formData.country} 
          onValueChange={(value) => handleInputChange("country", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="UK">United Kingdom</SelectItem>
            <SelectItem value="CA">Canada</SelectItem>
            <SelectItem value="AU">Australia</SelectItem>
            <SelectItem value="FR">France</SelectItem>
            <SelectItem value="DE">Germany</SelectItem>
            <SelectItem value="JP">Japan</SelectItem>
            <SelectItem value="SG">Singapore</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
