
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { DocumentPreview } from "@/components/document-viewer/DocumentPreview";
import { Separator } from "@/components/ui/separator";
import { BankDetailsSection } from "@/components/deposit/BankDetailsSection";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Building } from "lucide-react";

export default function InvoicePayment() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load invoice details"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invoice not found</p>
      </div>
    );
  }

  const showBlockchainDetails = invoice.payment_method === "blockchain_transfer";
  const showBankDetails = invoice.payment_method === "bank_transfer";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Invoice Payment</h1>
        
        <Card className="p-6">
          <DocumentPreview
            documentType="invoice"
            documentData={{
              id: invoice.id,
              number: invoice.invoice_number,
              vendor_or_client: invoice.client_name,
              issue_date: invoice.issue_date,
              due_date: invoice.due_date,
              amount: invoice.amount,
              description: invoice.description,
              payment_method: invoice.payment_method
            }}
          />
        </Card>

        <Separator />

        {showBlockchainDetails && (
          <BankDetailsSection
            title="Blockchain Payment Details"
            icon={Wallet}
            details={[
              { label: "Network", value: "Solana" },
              { label: "Wallet Address", value: "84nDYwF73bE73GJCsPqFxQZKBgfJf3nEWGJwJ9BBfbf9" }
            ]}
            onCopy={(text, label) => {
              navigator.clipboard.writeText(text);
              toast({
                title: "Copied",
                description: `${label} copied to clipboard`
              });
            }}
          />
        )}

        {showBankDetails && (
          <BankDetailsSection
            title="Bank Transfer Details"
            icon={Building}
            details={[
              { label: "Bank Name", value: "Example Bank" },
              { label: "Account Name", value: "Company Ltd" },
              { label: "Account Number", value: "1234567890" },
              { label: "Sort Code", value: "12-34-56" },
              { label: "Reference", value: invoice.invoice_number }
            ]}
            onCopy={(text, label) => {
              navigator.clipboard.writeText(text);
              toast({
                title: "Copied",
                description: `${label} copied to clipboard`
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
