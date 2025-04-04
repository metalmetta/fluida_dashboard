
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { format } from "date-fns";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { ViewInvoiceDialog } from "@/components/ViewInvoiceDialog";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import { DocumentsHeader } from "@/components/documents/DocumentsHeader";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { SubtitleCard } from "@/components/ui/subtitle-card";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export default function Invoices() {
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | null>(null);
  const { invoices, isLoading, fetchInvoices, formatPaymentMethod } = useInvoices();
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

  const statusFilters = [
    { value: "draft", label: "Draft", count: statusCounts.draft },
    { value: "sent", label: "Sent", count: statusCounts.sent },
    { value: "paid", label: "Paid", count: statusCounts.paid },
    { value: "overdue", label: "Overdue", count: statusCounts.overdue },
    { value: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
  ];

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

  const getStatusVariant = (status: string) => {
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

  const handleStatusChange = (status: string | null) => {
    if (status === null || ["draft", "sent", "paid", "overdue", "cancelled"].includes(status)) {
      setSelectedStatus(status as InvoiceStatus | null);
    }
  };

  const columns = [
    { header: "Customer", accessorKey: "client_name" as keyof Invoice },
    { header: "Amount", accessorKey: "amount" as keyof Invoice,
      cell: (item: Invoice) => `$${item.amount.toFixed(2)}` },
    { header: "Method", accessorKey: "payment_method" as keyof Invoice,
      cell: (item: Invoice) => formatPaymentMethod(item.payment_method) },
    { header: "Due date", accessorKey: "due_date" as keyof Invoice,
      cell: (item: Invoice) => formatDate(item.due_date) },
    { header: "Invoice ID", accessorKey: "invoice_number" as keyof Invoice },
    { header: "Status", accessorKey: "status" as keyof Invoice },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DocumentsHeader
          title="Invoices"
          description="Manage your invoices"
          statusFilters={statusFilters}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          actionButtons={[
            {
              icon: Plus,
              label: "Create invoice",
              variant: "default" as const,
              onClick: () => setCreateDialogOpen(true)
            }
          ]}
        />

        <SubtitleCard 
          text="Create, send, and track invoices all in one place."
          tooltip="Generate professional invoices and monitor their payment status easily."
        />

        <Card>
          <DocumentsTable
            documents={filteredInvoices}
            isLoading={isLoading}
            columns={columns}
            onRowClick={handleViewInvoice}
            statusKey="status"
            getStatusVariant={getStatusVariant}
            emptyState={{
              title: "No invoices found",
              description: "You don't have any invoices yet.",
              buttonText: "Create invoice",
              onButtonClick: () => setCreateDialogOpen(true)
            }}
          />
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
