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
import { Plus, Download } from "lucide-react";
import { useState } from "react";

const invoices = [
  {
    id: "INV-001",
    date: "2024-01-15",
    client: "Acme Corp",
    amount: "$1,200.00",
    status: "Paid",
    method: "Credit Card",
    dueDate: "2024-02-15",
    product: "Consulting Services",
  },
  {
    id: "INV-002",
    date: "2024-01-18",
    client: "Tech Solutions",
    amount: "$3,500.00",
    status: "Unpaid",
    method: "Bank Transfer",
    dueDate: "2024-02-18",
    product: "Software License",
  },
  {
    id: "INV-003",
    date: "2024-01-20",
    client: "Global Services",
    amount: "$2,800.00",
    status: "Draft",
    method: "PayPal",
    dueDate: "2024-02-20",
    product: "Marketing Campaign",
  },
];

type InvoiceStatus = "Draft" | "Unpaid" | "Paid" | "Void";

export default function Invoices() {
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | null>(null);

  const statusCounts = {
    Draft: invoices.filter((inv) => inv.status === "Draft").length,
    Unpaid: invoices.filter((inv) => inv.status === "Unpaid").length,
    Paid: invoices.filter((inv) => inv.status === "Paid").length,
    Void: invoices.filter((inv) => inv.status === "Void").length,
  };

  const filteredInvoices = selectedStatus
    ? invoices.filter((inv) => inv.status === selectedStatus)
    : invoices;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Invoices</h1>
            <p className="text-muted-foreground">Manage your invoices</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create invoice
          </Button>
        </div>

        <div className="flex space-x-6 border-b">
          {(["Draft", "Unpaid", "Paid", "Void"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`flex items-center space-x-2 pb-4 ${
                selectedStatus === status
                  ? "border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{status}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-sm">
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Product/service</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.product}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
} 