
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, AlertCircle, ArrowRightLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBills } from "@/hooks/useBills";
import { formatCurrency } from "@/lib/utils";
import { AddBillDialog } from "@/components/AddBillDialog";
import { BillFormData, Bill } from "@/types/bill";
import { ViewBillDialog } from "@/components/ViewBillDialog";

export default function Bills() {
  const { bills, isLoading, addBill, updateBillStatus } = useBills();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [addBillDialogOpen, setAddBillDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [viewBillDialogOpen, setViewBillDialogOpen] = useState(false);

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

  const handleAddBill = async (billData: BillFormData) => {
    await addBill(billData);
  };
  
  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setViewBillDialogOpen(true);
  };
  
  const handleStatusChange = async (billId: string, newStatus: Bill['status']) => {
    await updateBillStatus(billId, newStatus);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Bills</h1>
          <div className="flex gap-3">
            <Button variant="outline">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transfer funds
            </Button>
            <Button onClick={() => setAddBillDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add bill
            </Button>
          </div>
        </div>

        <div className="flex gap-8 border-b pb-1">
          <button
            onClick={() => setSelectedStatus("Draft")}
            className={`flex items-center gap-2 pb-2 ${
              selectedStatus === "Draft" ? "border-b-2 border-primary" : ""
            }`}
          >
            Draft
            <Badge variant="secondary" className="rounded-full">{statusCounts.Draft}</Badge>
          </button>
          <button
            onClick={() => setSelectedStatus("Approve")}
            className={`flex items-center gap-2 pb-2 ${
              selectedStatus === "Approve" ? "border-b-2 border-primary" : ""
            }`}
          >
            Approve
            <Badge variant="secondary" className="rounded-full">{statusCounts.Approve}</Badge>
          </button>
          <button
            onClick={() => setSelectedStatus("Ready for payment")}
            className={`flex items-center gap-2 pb-2 ${
              selectedStatus === "Ready for payment" ? "border-b-2 border-primary" : ""
            }`}
          >
            Ready for payment
            <Badge variant="secondary" className="rounded-full">{statusCounts["Ready for payment"]}</Badge>
          </button>
          <button
            onClick={() => setSelectedStatus("Paid")}
            className={`flex items-center gap-2 pb-2 ${
              selectedStatus === "Paid" ? "border-b-2 border-primary" : ""
            }`}
          >
            Paid
            <Badge variant="secondary" className="rounded-full">{statusCounts.Paid}</Badge>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Forward invoices to <span className="font-medium">bills@ap.acctual.com</span>
          </div>
        </div>

        <Card>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading bills...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No bills found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedStatus
                  ? `No bills with status "${selectedStatus}"`
                  : "You don't have any bills yet"}
              </p>
              <Button onClick={() => setAddBillDialogOpen(true)} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add your first bill
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill ID</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow 
                    key={bill.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewBill(bill)}
                  >
                    <TableCell className="font-medium">{bill.bill_number}</TableCell>
                    <TableCell>{bill.vendor}</TableCell>
                    <TableCell>{bill.category || "N/A"}</TableCell>
                    <TableCell>{formatCurrency(bill.amount)}</TableCell>
                    <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={bill.status === "Ready for payment" ? "destructive" : "outline"}
                      >
                        {bill.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
