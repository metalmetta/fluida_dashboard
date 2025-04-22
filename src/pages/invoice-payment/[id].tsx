
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Invoice } from "@/types/invoice";
import { LoadingState } from "@/components/invoice-payment/LoadingState";
import { ErrorState } from "@/components/invoice-payment/ErrorState";
import { PaymentMethodDetails } from "@/components/invoice-payment/PaymentMethodDetails";

export default function InvoicePayment() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) {
        setError("Invoice ID is missing");
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching invoice with ID:", id);
        
        // Modified this query to use a simpler approach without JOIN
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", id)
          .maybeSingle();

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
        
        // Fetch payment method details if needed
        if (data.payment_method) {
          const { data: paymentMethodData, error: paymentMethodError } = await supabase
            .from("payment_methods")
            .select("*")
            .eq("id", data.payment_method)
            .maybeSingle();
            
          if (!paymentMethodError && paymentMethodData) {
            console.log("Payment method data:", paymentMethodData);
            // Merge payment method details into invoice
            setInvoice({
              ...data as Invoice,
              payment_method: paymentMethodData.type,
              payment_method_details: {
                label: paymentMethodData.label,
                type: paymentMethodData.type,
                iban: paymentMethodData.details?.iban,
                accountNumber: paymentMethodData.details?.accountNumber,
                bank_name: paymentMethodData.details?.bank_name,
                solanaAddress: paymentMethodData.details?.solanaAddress,
              }
            });
          } else {
            // Still set the invoice even if payment method fetch fails
            setInvoice(data as Invoice);
          }
        } else {
          setInvoice(data as Invoice);
        }
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
    return <LoadingState />;
  }

  if (error || !invoice) {
    return <ErrorState error={error} />;
  }

  const invoiceFormData = {
    client_name: invoice.client_name,
    client_email: "",
    invoice_number: invoice.invoice_number,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    items: [{
      description: invoice.description || "Services",
      quantity: 1,
      price: invoice.amount,
      amount: invoice.amount
    }],
    notes: invoice.description,
    payment_method: invoice.payment_method,
    payment_method_details: invoice.payment_method_details
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Invoice #{invoice.invoice_number}</h1>
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium capitalize">{invoice.status}</p>
            </div>
            <div>
              <p className="text-gray-500">Payment Method</p>
              <p className="font-medium capitalize">{invoice.payment_method?.replace(/_/g, ' ') || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-gray-500">Amount Due</p>
              <p className="font-medium">{invoice.currency || 'USD'} {invoice.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <InvoicePreview
            form={invoiceFormData}
            companyName="Your Company"
            companyEmail="company@example.com"
            calculateTotal={() => invoice.amount}
          />
        </Card>

        <Separator />

        <PaymentMethodDetails invoice={invoice} />
      </div>
    </div>
  );
}
