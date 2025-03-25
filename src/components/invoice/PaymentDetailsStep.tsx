
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { InvoiceFormData } from "@/types/invoice";

interface PaymentDetailsStepProps {
  form: InvoiceFormData;
  setForm: (form: InvoiceFormData) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function PaymentDetailsStep({
  form,
  setForm,
  onPrevious,
  onNext
}: PaymentDetailsStepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Payment Details</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Input
            id="payment_method"
            placeholder="e.g., Credit Card, Bank Transfer, PayPal"
            value={form.payment_method || ""}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payment_instructions">Payment Instructions</Label>
          <Textarea
            id="payment_instructions"
            placeholder="Add payment instructions, bank details, or other payment information..."
            value={form.payment_instructions || ""}
            onChange={(e) => setForm({ ...form, payment_instructions: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext}>
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
