
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { InvoiceFormData } from "@/types/invoice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<{id: string, label: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      supabase
        .from('payment_methods')
        .select('id, type, label, is_default')
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setPaymentMethods(data.map(method => ({
              id: method.id,
              label: method.label
            })));
          }
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Payment Details</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select
            value={form.payment_method || ""}
            onValueChange={(value) => setForm({ ...form, payment_method: value })}
          >
            <SelectTrigger id="payment_method">
              <SelectValue placeholder="Select a payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="crypto">Cryptocurrency</SelectItem>
              {paymentMethods.map(method => (
                <SelectItem key={method.id} value={method.id}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
