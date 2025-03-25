import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { InvoiceFormData } from "@/types/invoice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentDetailsStepProps {
  form: InvoiceFormData;
  setForm: (form: InvoiceFormData) => void;
  onPrevious: () => void;
  onNext: () => void;
}

interface PaymentMethod {
  id: string;
  label: string;
  type: string;
  details?: {
    iban?: string;
    accountNumber?: string;
  };
}

export function PaymentDetailsStep({
  form,
  setForm,
  onPrevious,
  onNext
}: PaymentDetailsStepProps) {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(form.payment_method || "");

  useEffect(() => {
    if (user) {
      setLoading(true);
      // We need to use the "as any" type assertion since the TypeScript types don't know about our payment_methods table
      supabase
        .from('payment_methods' as any)
        .select('id, label, type, details')
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setPaymentMethods(data.map((method: any) => ({
              id: method.id,
              label: method.label,
              type: method.type,
              details: method.details
            })));
          }
          setLoading(false);
        });
    }
  }, [user]);

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
      setForm({ 
        ...form, 
        payment_method: methodId,
        payment_method_details: {
          label: selectedMethod.label,
          type: selectedMethod.type,
          iban: selectedMethod.details?.iban,
          accountNumber: selectedMethod.details?.accountNumber
        }
      });
    } else {
      setForm({ ...form, payment_method: methodId });
    }
  };

  // Filter payment methods based on type (bank accounts or blockchain wallets)
  const getBankAccounts = () => {
    return paymentMethods.filter(method => 
      method.type === "usd" || method.type === "eur" || method.type === "gbp"
    );
  };

  const getBlockchainWallets = () => {
    return paymentMethods.filter(method => 
      method.type === "usdc"
    );
  };

  // Format the bank account display to show currency and last 4 digits of IBAN
  const formatBankAccountLabel = (account: PaymentMethod) => {
    const currency = account.type.toUpperCase();
    const iban = account.details?.iban || "";
    const accountNumber = account.details?.accountNumber || "";
    
    let lastDigits = "";
    if (iban && iban.length >= 4) {
      lastDigits = iban.slice(-4);
    } else if (accountNumber && accountNumber.length >= 4) {
      lastDigits = accountNumber.slice(-4);
    }
    
    if (lastDigits) {
      return `${account.label} (${currency} - ****${lastDigits})`;
    }
    
    return `${account.label} (${currency})`;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Payment Details</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="payment_type">Payment Method Type</Label>
          <Select
            value={selectedPaymentType}
            onValueChange={handlePaymentTypeChange}
          >
            <SelectTrigger id="payment_type">
              <SelectValue placeholder="Select a payment method type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="blockchain_transfer">Blockchain Transfer</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Bank Transfer dropdown - show only if bank_transfer is selected */}
        {selectedPaymentType === "bank_transfer" && (
          <div className="space-y-2">
            <Label htmlFor="bank_account">Select Bank Account</Label>
            <Select
              value={form.payment_method === "bank_transfer" ? "" : form.payment_method}
              onValueChange={handleSpecificMethodChange}
            >
              <SelectTrigger id="bank_account">
                <SelectValue placeholder="Select a bank account" />
              </SelectTrigger>
              <SelectContent>
                {getBankAccounts().length > 0 ? (
                  getBankAccounts().map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {formatBankAccountLabel(account)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_accounts" disabled>No bank accounts available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Blockchain Transfer dropdown - show only if blockchain_transfer is selected */}
        {selectedPaymentType === "blockchain_transfer" && (
          <div className="space-y-2">
            <Label htmlFor="wallet_address">Select Wallet Address</Label>
            <Select
              value={form.payment_method === "blockchain_transfer" ? "" : form.payment_method}
              onValueChange={handleSpecificMethodChange}
            >
              <SelectTrigger id="wallet_address">
                <SelectValue placeholder="Select a wallet address" />
              </SelectTrigger>
              <SelectContent>
                {getBlockchainWallets().length > 0 ? (
                  getBlockchainWallets().map(wallet => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_wallets" disabled>No wallet addresses available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        
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
