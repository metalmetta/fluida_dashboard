
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Search } from "lucide-react";

const transactions = [
  {
    id: "TX123",
    date: "2024-02-20",
    vendor: "Acme Corp",
    amount: "$1,234.56",
    status: "completed",
  },
  {
    id: "TX124",
    date: "2024-02-19",
    vendor: "Tech Solutions Inc",
    amount: "$2,845.00",
    status: "pending",
  },
  {
    id: "TX125",
    date: "2024-02-18",
    vendor: "Global Services Ltd",
    amount: "$975.20",
    status: "completed",
  },
];

export default function Transactions() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Transactions</h1>
          <Button>New Transaction</Button>
        </div>

        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-9"
                />
              </div>
              <Button variant="outline">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </div>

            <div className="divide-y">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{transaction.vendor}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.id} • {transaction.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">{transaction.amount}</p>
                    <Badge variant={transaction.status === "completed" ? "success" : "outline"}>
                      {transaction.status}
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
