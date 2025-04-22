
import React from "react";
import { Card } from "@/components/ui/card";
import { BankDetailsSection } from "@/components/deposit/BankDetailsSection";
import { Wallet, Building } from "lucide-react";
import { Invoice } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodDetailsProps {
  invoice: Invoice;
}

export function PaymentMethodDetails({ invoice }: PaymentMethodDetailsProps) {
  const { toast } = useToast();
  const showBlockchainDetails = invoice.payment_method === "blockchain_transfer";
  const showBankDetails = invoice.payment_method === "bank_transfer";

  const getPaymentMethodDetails = () => {
    if (!invoice.payment_method_details) return [];

    if (showBlockchainDetails) {
      return [
        { label: "Network", value: "Solana" },
        { 
          label: "Wallet Address", 
          value: invoice.payment_method_details.solanaAddress || "Address not available"
        }
      ];
    }

    if (showBankDetails) {
      return [
        { 
          label: "Bank Name", 
          value: invoice.payment_method_details.bank_name || "Bank name not available"
        },
        { 
          label: "Account Name", 
          value: invoice.payment_method_details.label || "Account name not available"
        },
        { 
          label: invoice.payment_method_details.iban ? "IBAN" : "Account Number",
          value: invoice.payment_method_details.iban || invoice.payment_method_details.accountNumber || "Account details not available"
        },
        { 
          label: "Reference", 
          value: invoice.invoice_number 
        }
      ];
    }

    return [];
  };

  if (!showBlockchainDetails && !showBankDetails) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600">
          No payment details available for the selected payment method. 
          Please contact the invoice sender for payment instructions.
        </p>
      </Card>
    );
  }

  return (
    <BankDetailsSection
      title={showBlockchainDetails ? "Blockchain Payment Details" : "Bank Transfer Details"}
      icon={showBlockchainDetails ? Wallet : Building}
      details={getPaymentMethodDetails()}
      onCopy={(text, label) => {
        navigator.clipboard.writeText(text);
        toast({
          title: "Copied",
          description: `${label} copied to clipboard`
        });
      }}
    />
  );
}
