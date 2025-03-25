
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText } from "lucide-react";

const invoices = [
  {
    id: "INV-001",
    vendor: "Acme Corp",
    amount: "$3,450.00",
    date: "Feb 20, 2024",
    status: "paid",
  },
  {
    id: "INV-002",
    vendor: "Tech Solutions",
    amount: "$1,890.00",
    date: "Feb 18, 2024",
    status: "pending",
  },
  {
    id: "INV-003",
    vendor: "Global Services",
    amount: "$2,750.00",
    date: "Feb 15, 2024",
    status: "paid",
  },
];

export default function Invoices() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Invoices</h1>
          <Button>Create Invoice</Button>
        </div>

        <Card>
          <div className="p-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-9"
              />
            </div>

            <div className="divide-y">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.vendor}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.id} • {invoice.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">{invoice.amount}</p>
                    <Badge variant={invoice.status === "paid" ? "success" : "outline"}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
