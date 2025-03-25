
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { InvoiceFormData } from "@/types/invoice";

interface TermsStepProps {
  form: InvoiceFormData;
  setForm: (form: InvoiceFormData) => void;
  isSubmitting: boolean;
  onPrevious: () => void;
  onSubmit: () => void;
}

export function TermsStep({
  form,
  setForm,
  isSubmitting,
  onPrevious,
  onSubmit
}: TermsStepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Terms & Notes</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            placeholder="Add terms and conditions for this invoice..."
            value={form.terms || ""}
            onChange={(e) => setForm({ ...form, terms: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes or information..."
            value={form.notes || ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="space-x-2">
          <Button variant="outline">Save Draft</Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </div>
    </div>
  );
}
