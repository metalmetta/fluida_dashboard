import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const recentPayments = [
  {
    id: "PAY-001",
    recipient: "Sarah Wilson",
    email: "sarah@example.com",
    amount: "$2,400.00",
    date: "Jan 15, 2024",
    status: "Completed",
  },
  {
    id: "PAY-002",
    recipient: "Alex Thompson",
    email: "alex@example.com",
    amount: "$1,800.00",
    date: "Jan 18, 2024",
    status: "Processing",
  },
  {
    id: "PAY-003",
    recipient: "Michael Brown",
    email: "michael@example.com",
    amount: "$3,200.00",
    date: "Jan 20, 2024",
    status: "Failed",
  },
];

export default function Payments() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Payments</h1>
            <p className="text-muted-foreground">Manage your payment transactions</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Payment
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Sent</h3>
            <p className="text-2xl font-bold mt-2">$24,500.00</p>
            <p className="text-sm text-muted-foreground mt-1">+12.5% from last month</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
            <p className="text-2xl font-bold mt-2">$1,800.00</p>
            <p className="text-sm text-muted-foreground mt-1">2 payments processing</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Failed</h3>
            <p className="text-2xl font-bold mt-2">$3,200.00</p>
            <p className="text-sm text-muted-foreground mt-1">1 payment failed</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Recent Payments</h3>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar />
                  <div>
                    <p className="font-medium">{payment.recipient}</p>
                    <p className="text-sm text-muted-foreground">{payment.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{payment.amount}</p>
                    <p className="text-sm text-muted-foreground">{payment.date}</p>
                  </div>
                  <Badge
                    variant={
                      payment.status === "Completed"
                        ? "success"
                        : payment.status === "Processing"
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
} 