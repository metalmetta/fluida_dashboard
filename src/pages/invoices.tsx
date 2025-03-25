
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { format } from "date-fns";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { ViewInvoiceDialog } from "@/components/ViewInvoiceDialog";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Invoice } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export default function Invoices() {
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | null>(null);
  const { invoices, isLoading, addSampleInvoices, fetchInvoices } = useInvoices();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState({
    name: "Your Company",
    email: "company@example.com"
  });

  const statusCounts = {
    draft: invoices.filter((inv) => inv.status === "draft").length,
    sent: invoices.filter((inv) => inv.status === "sent").length,
    paid: invoices.filter((inv) => inv.status === "paid").length,
    overdue: invoices.filter((inv) => inv.status === "overdue").length,
    cancelled: invoices.filter((inv) => inv.status === "cancelled").length,
  };

  const filteredInvoices = selectedStatus
    ? invoices.filter((inv) => inv.status === selectedStatus)
    : invoices;

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("company_name, email, full_name")
          .eq("id", userData.user.id)
          .single();
        
        if (data) {
          setCompanyInfo({
            name: data.company_name || data.full_name || "Your Company",
            email: data.email || "company@example.com"
          });
        }
      }
    };
    
    fetchCompanyInfo();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeVariant = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return "success";
      case "sent":
        return "secondary";
      case "draft":
        return "outline";
      case "overdue":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: Invoice['status']) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", invoiceId);

      if (error) throw error;
      
      // Refresh invoices list
      await fetchInvoices();
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Invoices</h1>
            <p className="text-muted-foreground">Manage your invoices</p>
          </div>
          <div>
            {invoices.length === 0 && (
              <Button onClick={addSampleInvoices} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Add Sample Data
              </Button>
            )}
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create invoice
            </Button>
          </div>
        </div>

        <div className="flex space-x-6 border-b">
          {(["draft", "sent", "paid", "overdue", "cancelled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
              className={`flex items-center space-x-2 pb-4 ${
                selectedStatus === status
                  ? "border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="capitalize">{status}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-sm">
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>

        <Card>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <FileText className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No invoices found</h3>
              <p className="text-muted-foreground mt-2">
                You don't have any invoices yet. Add sample data or create a new invoice.
              </p>
              <Button onClick={addSampleInvoices} className="mt-4">
                Add Sample Invoices
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewInvoice(invoice)}
                  >
                    <TableCell>{invoice.client_name}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{invoice.payment_method || "—"}</TableCell>
                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <CreateInvoiceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onInvoiceCreated={fetchInvoices}
        companyName={companyInfo.name}
        companyEmail={companyInfo.email}
      />

      <ViewInvoiceDialog 
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        invoice={selectedInvoice}
        onStatusChange={updateInvoiceStatus}
      />
    </DashboardLayout>
  );
}
