
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceFormData, PaymentMethod } from "@/types/invoice";
import { usePaymentMethods } from "@/components/settings/payment-methods/usePaymentMethods";

interface PaymentDetailsStepProps {
  form: InvoiceFormData;
  setForm: (form: InvoiceFormData) => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function PaymentDetailsStep({
  form,
  setForm,
  onPrevious,
  onSubmit,
  isSubmitting
}: PaymentDetailsStepProps) {
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>(form.payment_method || "");
  const { paymentMethods, loading } = usePaymentMethods();

  // Set initial payment type based on form data
  useEffect(() => {
    if (form.payment_method) {
      // Check if it's one of our known types or a specific method
      if (
        form.payment_method === "bank_transfer" ||
        form.payment_method === "blockchain_transfer" ||
        form.payment_method === "credit_card"
      ) {
        setSelectedPaymentType(form.payment_method);
      } else {
        // Try to determine the type from available payment methods
        const method = paymentMethods.find(
          (method) => method.id === form.payment_method
        );
        if (method) {
          if (["usd", "eur", "gbp"].includes(method.type)) {
            setSelectedPaymentType("bank_transfer");
          } else if (method.type === "usdc") {
            setSelectedPaymentType("blockchain_transfer");
          }
        }
      }
    }
  }, [form.payment_method, paymentMethods]);

  // Filter for fiat bank accounts (USD, EUR, GBP)
  const bankAccounts = paymentMethods.filter((method) =>
    ["usd", "eur", "gbp"].includes(method.type)
  );

  // Filter for crypto wallets (USDC)
  const cryptoWallets = paymentMethods.filter(
    (method) => method.type === "usdc"
  );

  // Format display label for bank accounts
  const formatBankAccountLabel = (method: PaymentMethod) => {
    const currency = method.type.toUpperCase();
    // Display the last 4 digits of IBAN if available
    if (method.details.iban) {
      const iban = method.details.iban;
      const lastFour = iban.slice(-4);
      return `${method.label} (${currency}) - ****${lastFour}`;
    }
    return `${method.label} (${currency})`;
  };

  // Handle payment method type selection
  const handlePaymentTypeChange = (value: string) => {
    setSelectedPaymentType(value);
    setForm({ 
      ...form, 
      payment_method: value,
      // Reset payment method details when changing payment type
      payment_method_details: undefined
    });
  };

  // Handle specific payment method selection for bank or blockchain
  const handleSpecificMethodChange = (methodId: string) => {
    const selectedMethod = paymentMethods.find(method => method.id === methodId);
    
    if (selectedMethod) {
      // Create appropriate payment_method_details based on the type
      const details: any = {
        label: selectedMethod.label,
        type: selectedMethod.type
      };
      
      // Add specific fields based on the payment method type
      if (selectedMethod.type === 'usdc') {
        details.solanaAddress = selectedMethod.details?.solanaAddress;
      } else {
        details.iban = selectedMethod.details?.iban;
        details.accountNumber = selectedMethod.details?.accountNumber;
        details.bank_name = selectedMethod.details?.bank_name;
      }
      
      setForm({ 
        ...form, 
        payment_method: methodId,
        payment_method_details: details
      });
    } else {
      setForm({ ...form, payment_method: methodId });
    }
  };

  // Filter payment methods based on type (bank accounts or blockchain wallets)
  const getAvailableMethodsByType = () => {
    if (selectedPaymentType === "bank_transfer") {
      return bankAccounts;
    } else if (selectedPaymentType === "blockchain_transfer") {
      return cryptoWallets;
    }
    return [];
  };

  // Determine if a specific selection is required
  const needsSpecificSelection =
    selectedPaymentType === "bank_transfer" ||
    selectedPaymentType === "blockchain_transfer";

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Payment Details</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <RadioGroup
            value={selectedPaymentType}
            onValueChange={handlePaymentTypeChange}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <div className="flex items-center space-x-2 rounded-md border p-4">
              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
              <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                Bank Transfer
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-4">
              <RadioGroupItem value="blockchain_transfer" id="blockchain_transfer" />
              <Label htmlFor="blockchain_transfer" className="flex-1 cursor-pointer">
                Blockchain Transfer
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-4">
              <RadioGroupItem value="credit_card" id="credit_card" />
              <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                Credit Card
              </Label>
            </div>
          </RadioGroup>
        </div>

        {needsSpecificSelection && getAvailableMethodsByType().length > 0 && (
          <div className="space-y-2">
            <Label>
              {selectedPaymentType === "bank_transfer"
                ? "Select Bank Account"
                : "Select Wallet Address"}
            </Label>
            <Select
              value={form.payment_method}
              onValueChange={handleSpecificMethodChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableMethodsByType().map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {selectedPaymentType === "bank_transfer"
                      ? formatBankAccountLabel(method)
                      : method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="payment_instructions">Payment Instructions</Label>
          <Textarea
            id="payment_instructions"
            placeholder="Add any specific instructions for payment..."
            value={form.payment_instructions || ""}
            onChange={(e) =>
              setForm({ ...form, payment_instructions: e.target.value })
            }
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Invoice"}
        </Button>
      </div>
    </div>
  );
}
