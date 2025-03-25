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
import { useState } from "react";

const bills = [
  {
    id: "BILL-001",
    vendor: "Office Supplies Co",
    amount: "$850.00",
    dueDate: "2024-02-01",
    status: "Draft",
    category: "Supplies",
  },
  {
    id: "BILL-002",
    vendor: "Internet Services",
    amount: "$199.99",
    dueDate: "2024-01-28",
    status: "Ready for payment",
    category: "Utilities",
  },
  {
    id: "BILL-003",
    vendor: "Marketing Agency",
    amount: "$3,500.00",
    dueDate: "2024-02-15",
    status: "Paid",
    category: "Marketing",
  },
];

const statusCounts = {
  Draft: bills.filter(bill => bill.status === "Draft").length,
  Approve: bills.filter(bill => bill.status === "Approve").length,
  "Ready for payment": bills.filter(bill => bill.status === "Ready for payment").length,
  Paid: bills.filter(bill => bill.status === "Paid").length,
};

export default function Bills() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredBills = selectedStatus
    ? bills.filter(bill => bill.status === selectedStatus)
    : bills;

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
            <Button>
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
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.id}</TableCell>
                  <TableCell>{bill.vendor}</TableCell>
                  <TableCell>{bill.category}</TableCell>
                  <TableCell>{bill.amount}</TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
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
        </Card>
      </div>
    </DashboardLayout>
  );
} 