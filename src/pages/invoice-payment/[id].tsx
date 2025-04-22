
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { DocumentPreview } from "@/components/document-viewer/DocumentPreview";
import { Separator } from "@/components/ui/separator";
import { BankDetailsSection } from "@/components/deposit/BankDetailsSection";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Building, AlertCircle } from "lucide-react";
import { Invoice } from "@/types/invoice";

export default function InvoicePayment() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) {
        setError("Invoice ID is missing");
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching invoice with ID:", id);
        
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        if (!data) {
          setError("Invoice not found");
          setLoading(false);
          return;
        }
        
        console.log("Invoice data retrieved:", data);
        setInvoice(data as Invoice);
      } catch (error: any) {
        console.error("Error fetching invoice:", error);
        setError("Could not load invoice details");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || "Invoice not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </Card>
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
              description: invoice.description || "",
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

        {!showBlockchainDetails && !showBankDetails && (
          <Card className="p-6">
            <p className="text-center text-gray-600">
              No payment details available for the selected payment method. 
              Please contact the invoice sender for payment instructions.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
