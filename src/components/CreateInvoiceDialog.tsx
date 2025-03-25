import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({ open, onOpenChange }: CreateInvoiceDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    taxId: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    // Here you would typically validate the form before proceeding
    setStep(2);
  };

  const handleSaveDraft = () => {
    // Handle saving draft logic
    onOpenChange(false);
  };

  const InvoicePreview = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-mattone text-[#2606EB]">INVOICE</h3>
            <p className="text-sm text-gray-500 mt-1">Draft</p>
          </div>
          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
            {/* Logo placeholder */}
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-600">From</h4>
            <div className="mt-1">
              <p className="font-semibold">{formData.company || 'Company name'}</p>
              <p className="text-sm text-gray-600">{formData.email || 'Email address'}</p>
              <p className="text-sm text-gray-600">{formData.address || 'Street address'}</p>
              <p className="text-sm text-gray-600">
                {[
                  formData.city,
                  formData.state,
                  formData.zipCode
                ].filter(Boolean).join(', ') || 'City, State, ZIP'}
              </p>
              <p className="text-sm text-gray-600">{formData.country || 'Country'}</p>
              {formData.taxId && (
                <p className="text-sm text-gray-600">Tax ID: {formData.taxId}</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-600">Bill To</h4>
            <div className="mt-1 text-sm text-gray-500">
              <p>Client details will be added in the next step</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Invoice Number</span>
              <span className="text-gray-600">Draft</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-semibold">Date</span>
              <span className="text-gray-600">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Company</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Enter company name..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Logo</Label>
                    <div className="mt-1">
                      <button className="w-12 h-12 rounded border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
                        <Plus className="h-6 w-6 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter state..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Enter ZIP code..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Enter country..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      placeholder="Enter tax ID..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleSaveDraft}>
                  Save draft
                </Button>
                <Button onClick={handleNext} className="bg-[#2606EB] hover:bg-[#2606EB]/90">
                  Next
                </Button>
              </div>
            </div>

            <div className="flex-1">
              <div className="sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Preview</h2>
                <InvoicePreview />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 