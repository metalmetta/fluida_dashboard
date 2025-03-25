import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const bills = [
  {
    id: "BILL-001",
    vendor: "Office Supplies Co",
    amount: "$850.00",
    dueDate: "2024-02-01",
    status: "Upcoming",
    category: "Supplies",
  },
  {
    id: "BILL-002",
    vendor: "Internet Services",
    amount: "$199.99",
    dueDate: "2024-01-28",
    status: "Overdue",
    category: "Utilities",
  },
  {
    id: "BILL-003",
    vendor: "Marketing Agency",
    amount: "$3,500.00",
    dueDate: "2024-02-15",
    status: "Upcoming",
    category: "Marketing",
  },
];

const upcomingPayments = [
  {
    vendor: "Office Supplies Co",
    amount: "$850.00",
    dueDate: "Feb 1, 2024",
  },
  {
    vendor: "Marketing Agency",
    amount: "$3,500.00",
    dueDate: "Feb 15, 2024",
  },
];

export default function Bills() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Bills</h1>
            <p className="text-muted-foreground">Track and manage your bills</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Upcoming Payments</h3>
            </div>
            <div className="space-y-4">
              {upcomingPayments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{payment.vendor}</p>
                    <p className="text-sm text-muted-foreground">Due {payment.dueDate}</p>
                  </div>
                  <p className="font-medium">{payment.amount}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-medium">Overdue Bills</h3>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Internet Services</p>
                <Badge variant="destructive">3 days overdue</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Due Jan 28, 2024</p>
              <div className="flex items-center justify-between">
                <p className="font-bold">$199.99</p>
                <Button variant="destructive" size="sm">Pay Now</Button>
              </div>
            </div>
          </Card>
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
              {bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.id}</TableCell>
                  <TableCell>{bill.vendor}</TableCell>
                  <TableCell>{bill.category}</TableCell>
                  <TableCell>{bill.amount}</TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={bill.status === "Overdue" ? "destructive" : "outline"}
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