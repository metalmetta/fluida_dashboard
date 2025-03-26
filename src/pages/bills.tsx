
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Plus, ArrowRightLeft, DollarSign } from "lucide-react";
import { useBills } from "@/hooks/useBills";
import { formatCurrency } from "@/lib/utils";
import { AddBillDialog } from "@/components/AddBillDialog";
import { Bill } from "@/types/bill";
import { ViewBillDialog } from "@/components/ViewBillDialog";
import { DocumentsHeader } from "@/components/documents/DocumentsHeader";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Bills() {
  const { bills, isLoading, addBill, updateBillStatus } = useBills();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [addBillDialogOpen, setAddBillDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [viewBillDialogOpen, setViewBillDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredBills = selectedStatus
    ? bills.filter(bill => bill.status === selectedStatus)
    : bills;

  // Count bills by status
  const statusCounts = {
    Draft: bills.filter(bill => bill.status === "Draft").length,
    Approve: bills.filter(bill => bill.status === "Approve").length,
    "Ready for payment": bills.filter(bill => bill.status === "Ready for payment").length,
    Paid: bills.filter(bill => bill.status === "Paid").length,
  };

  const statusFilters = [
    { value: "Draft", label: "Draft", count: statusCounts.Draft },
    { value: "Approve", label: "Approve", count: statusCounts.Approve },
    { value: "Ready for payment", label: "Ready for payment", count: statusCounts["Ready for payment"] },
    { value: "Paid", label: "Paid", count: statusCounts.Paid },
  ];

  const handleAddBill = async (billData: Omit<Bill, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await addBill(billData);
  };
  
  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setViewBillDialogOpen(true);
  };
  
  const handleStatusChange = async (billId: string, newStatus: Bill['status']) => {
    await updateBillStatus(billId, newStatus);
  };

  const handlePayBill = async (bill: Bill) => {
    try {
      await updateBillStatus(bill.id, "Paid");
      toast({
        title: "Payment successful",
        description: `Bill ${bill.bill_number} has been marked as paid.`
      });
    } catch (error) {
      console.error("Error paying bill:", error);
      toast({
        title: "Payment failed",
        description: "There was an error processing the payment.",
        variant: "destructive"
      });
    }
  };

  const getStatusVariant = (status: string) => {
    if (status === "Ready for payment") return "destructive";
    if (status === "Paid") return "success";
    return "outline";
  };

  // Function to render currency with symbol
  const renderCurrency = (item: Bill) => {
    const symbol = item.currency === 'EUR' ? '€' : 
                  item.currency === 'GBP' ? '£' : '$';
    return `${symbol}${item.amount.toFixed(2)}`;
  };

  const columns = [
    { header: "Bill ID", accessorKey: "bill_number" as keyof Bill },
    { header: "Vendor", accessorKey: "vendor" as keyof Bill },
    { header: "Category", accessorKey: "category" as keyof Bill, 
      cell: (item: Bill) => item.category || "N/A" },
    { header: "Amount", accessorKey: "amount" as keyof Bill,
      cell: (item: Bill) => renderCurrency(item) },
    { header: "Due Date", accessorKey: "due_date" as keyof Bill,
      cell: (item: Bill) => new Date(item.due_date).toLocaleDateString() },
    { header: "Status", accessorKey: "status" as keyof Bill },
  ];

  // Function to render row actions based on bill status
  const renderRowActions = (bill: Bill) => {
    if (bill.status === "Ready for payment") {
      return (
        <Button 
          size="sm" 
          variant="default" 
          onClick={() => handlePayBill(bill)}
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Pay
        </Button>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DocumentsHeader
          title="Bills"
          statusFilters={statusFilters}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          actionButtons={[
            {
              icon: ArrowRightLeft,
              label: "Transfer funds",
              variant: "outline",
              onClick: () => {}
            },
            {
              icon: Plus,
              label: "Add bill",
              onClick: () => setAddBillDialogOpen(true)
            }
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Forward invoices to <span className="font-medium">bills@getfluida.com</span>
          </div>
        </div>

        <Card>
          <DocumentsTable
            documents={filteredBills}
            isLoading={isLoading}
            columns={columns}
            onRowClick={handleViewBill}
            statusKey="status"
            getStatusVariant={getStatusVariant}
            renderRowActions={renderRowActions}
            emptyState={{
              title: "No bills found",
              description: selectedStatus
                ? `No bills with status "${selectedStatus}"`
                : "You don't have any bills yet",
              buttonText: "Add your first bill",
              onButtonClick: () => setAddBillDialogOpen(true)
            }}
          />
        </Card>
      </div>

      <AddBillDialog 
        open={addBillDialogOpen} 
        onOpenChange={setAddBillDialogOpen} 
        onSubmit={handleAddBill} 
      />
      
      <ViewBillDialog
        open={viewBillDialogOpen}
        onOpenChange={setViewBillDialogOpen}
        bill={selectedBill}
        onStatusChange={handleStatusChange}
      />
    </DashboardLayout>
  );
}
