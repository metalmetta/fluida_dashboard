import React from "react";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { Invoice } from "@/types/invoice";
import { DocumentSidebar } from "./document-viewer/DocumentSidebar";
import { DocumentPreview } from "./document-viewer/DocumentPreview";
import { useDocumentStatus } from "@/hooks/useDocumentStatus";

interface ViewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onStatusChange: (invoiceId: string, newStatus: Invoice['status']) => Promise<void>;
}

export function ViewInvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onStatusChange
}: ViewInvoiceDialogProps) {
  const invoiceStatuses = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const {
    status,
    setStatus,
    isUpdating,
    handleUpdateStatus
  } = useDocumentStatus<Invoice['status']>({
    documentId: invoice?.id,
    initialStatus: invoice?.status,
    onStatusChange,
    documentType: "Invoice"
  });

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col md:flex-row gap-4 p-0">
        <DocumentSidebar
          title="Invoice"
          status={status || "draft"}
          statuses={invoiceStatuses}
          isUpdating={isUpdating}
          onStatusChange={(value) => setStatus(value as Invoice['status'])}
          onUpdate={handleUpdateStatus}
          documentId={invoice.id}
        />
        
        <div className="md:w-2/3 bg-gray-50 flex items-center justify-center p-4">
          <DocumentPreview
            documentType="invoice"
            documentData={{
              id: invoice.id,
              number: invoice.invoice_number,
              vendor_or_client: invoice.client_name,
              issue_date: invoice.issue_date,
              due_date: invoice.due_date,
              amount: invoice.amount,
              currency: invoice.currency,
              description: invoice.description,
              payment_method: invoice.payment_method,
              payment_method_details: invoice.payment_method_details
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
