
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BusinessAddressFormProps {
  street: string;
  setStreet: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  postalCode: string;
  setPostalCode: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
}

export function BusinessAddressForm({
  street,
  setStreet,
  city,
  setCity,
  state,
  setState,
  postalCode,
  setPostalCode,
  country,
  setCountry,
}: BusinessAddressFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Business Address</h2>
      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="state">State / Province</Label>
        <Input
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="postalCode">Postal / ZIP Code</Label>
        <Input
          id="postalCode"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />
      </div>
    </div>
  );
}
