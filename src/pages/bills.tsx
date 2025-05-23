import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Plus, DollarSign } from "lucide-react";
import { useBills } from "@/hooks/useBills";
import { formatCurrency } from "@/lib/utils";
import { AddBillDialog } from "@/components/AddBillDialog";
import { Bill } from "@/types/bill";
import { ViewBillDialog } from "@/components/ViewBillDialog";
import { DocumentsHeader } from "@/components/documents/DocumentsHeader";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PayBillDialog } from "@/components/PayBillDialog";
import { TopUpBalanceDialog } from "@/components/TopUpBalanceDialog";
import { useUserBalance } from "@/hooks/useUserBalance";
import { SubtitleCard } from "@/components/ui/subtitle-card";
import { ImportPdfButton } from "@/components/ImportPdfButton";

export default function Bills() {
  const { bills, isLoading, addBill, updateBillStatus } = useBills();
  const { balance, isLoading: isBalanceLoading, updateBalance } = useUserBalance();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [addBillDialogOpen, setAddBillDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [viewBillDialogOpen, setViewBillDialogOpen] = useState(false);
  const [payBillDialogOpen, setPayBillDialogOpen] = useState(false);
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredBills = selectedStatus
    ? bills.filter(bill => bill.status === selectedStatus)
    : bills;

  const statusCounts = {
    Draft: bills.filter(bill => bill.status === "Draft").length,
    "Ready for payment": bills.filter(bill => bill.status === "Ready for payment").length,
    Paid: bills.filter(bill => bill.status === "Paid").length,
  };

  const statusFilters = [
    { value: "Draft", label: "Draft", count: statusCounts.Draft },
    { value: "Ready for payment", label: "Ready", count: statusCounts["Ready for payment"] },
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
      if (!balance) {
        throw new Error("Balance information not available");
      }

      const success = await updateBalance(-bill.amount);
      if (!success) {
        throw new Error("Failed to update balance");
      }

      await updateBillStatus(bill.id, "Paid");

      toast({
        title: "Payment successful",
        description: `Bill ${bill.bill_number} has been paid.`
      });

      setPayBillDialogOpen(false);
    } catch (error) {
      console.error("Error paying bill:", error);
      toast({
        title: "Payment failed",
        description: "There was an error processing the payment.",
        variant: "destructive"
      });
    }
  };

  const handlePayButtonClick = (bill: Bill) => {
    setSelectedBill(bill);
    setPayBillDialogOpen(true);
  };

  const handleTopUpBalance = async (amount: number) => {
    return await updateBalance(amount);
  };

  const openTopUpDialog = () => {
    setTopUpDialogOpen(true);
  };

  const getStatusVariant = (status: string) => {
    if (status === "Ready for payment") return "destructive";
    if (status === "Paid") return "success";
    return "outline";
  };

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

  const renderRowActions = (bill: Bill) => {
    if (bill.status === "Ready for payment") {
      return (
        <Button 
          size="sm" 
          variant="default" 
          onClick={(e) => {
            e.stopPropagation();
            handlePayButtonClick(bill);
          }}
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Pay
        </Button>
      );
    }
    return null;
  };

  const handleImportedPdf = async (billData: any) => {
    const formattedBillData = {
      vendor: billData.vendor || '',
      amount: billData.amount || 0,
      due_date: billData.dueDate || new Date().toISOString().split('T')[0],
      status: 'Draft' as const,
      bill_number: billData.billNumber || '',
      issue_date: new Date().toISOString().split('T')[0],
      category: billData.category || '',
      description: billData.description || '',
      currency: billData.currency || 'USD',
      document_url: billData.documentUrl || '',
      ocr_data: billData
    };

    await addBill(formattedBillData);
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
              icon: Plus,
              label: "Add bill",
              onClick: () => setAddBillDialogOpen(true)
            }
          ]}
          additionalActions={(
            <ImportPdfButton 
              onImportSuccess={handleImportedPdf} 
            />
          )}
        />

        <SubtitleCard 
          text="Manage and pay your bills from one central location."
          tooltip="Forward invoices to bills@getfluida.com to automatically add them to your account."
        />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Forward invoices to <span className="font-medium">bills@getfluida.com</span>
          </div>
          {!isBalanceLoading && balance && (
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">Available Balance:</div>
              <div className="font-medium">
                {formatCurrency(balance.available_amount, balance.currency)}
              </div>
            </div>
          )}
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

      <PayBillDialog
        open={payBillDialogOpen}
        onOpenChange={setPayBillDialogOpen}
        bill={selectedBill}
        balance={balance}
        onPayBill={handlePayBill}
        onTopUpRequest={() => {
          setPayBillDialogOpen(false);
          setTopUpDialogOpen(true);
        }}
      />

      <TopUpBalanceDialog
        open={topUpDialogOpen}
        onOpenChange={setTopUpDialogOpen}
        onTopUp={handleTopUpBalance}
        currentCurrency={balance?.currency || "USD"}
      />
    </DashboardLayout>
  );
}
