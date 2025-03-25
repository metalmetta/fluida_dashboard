
import React from "react";
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { Bill } from "@/types/bill";
import { DocumentSidebar } from "./document-viewer/DocumentSidebar";
import { DocumentPreview } from "./document-viewer/DocumentPreview";
import { useDocumentStatus } from "@/hooks/useDocumentStatus";

interface ViewBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
  onStatusChange: (billId: string, newStatus: Bill['status']) => Promise<void>;
}

export function ViewBillDialog({ 
  open, 
  onOpenChange, 
  bill, 
  onStatusChange 
}: ViewBillDialogProps) {
  const billStatuses = [
    { value: "Draft", label: "Draft" },
    { value: "Approve", label: "Approve" },
    { value: "Ready for payment", label: "Ready for payment" },
    { value: "Paid", label: "Paid" }
  ];

  const {
    status,
    setStatus,
    isUpdating,
    handleUpdateStatus
  } = useDocumentStatus<Bill['status']>({
    documentId: bill?.id,
    initialStatus: bill?.status,
    onStatusChange,
    documentType: "Bill"
  });

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col md:flex-row gap-4 p-0">
        <DocumentSidebar
          title="Bill"
          status={status || "Draft"}
          statuses={billStatuses}
          isUpdating={isUpdating}
          onStatusChange={(value) => setStatus(value as Bill['status'])}
          onUpdate={handleUpdateStatus}
          documentId={bill.id}
        />
        
        <div className="md:w-2/3 bg-gray-50 flex items-center justify-center p-4">
          <DocumentPreview
            documentType="bill"
            documentData={{
              id: bill.id,
              number: bill.bill_number,
              vendor_or_client: bill.vendor,
              issue_date: bill.issue_date,
              due_date: bill.due_date,
              amount: bill.amount,
              description: bill.description,
              category: bill.category
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
