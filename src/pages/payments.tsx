
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePayments } from "@/hooks/usePayments";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function Payments() {
  const { payments, isLoading, totalSent, dueAmount } = usePayments();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayments = payments.filter(payment => {
    // Filter by status if selected
    if (statusFilter && payment.status !== statusFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payment.recipient.toLowerCase().includes(query) ||
        (payment.recipient_email && payment.recipient_email.toLowerCase().includes(query)) ||
        (payment.payment_reference && payment.payment_reference.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Payments</h1>
            <p className="text-muted-foreground">Manage your payment transactions</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Total Sent</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(totalSent, "USD")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Total amount of paid bills and completed transfers
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Due</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(dueAmount, "USD")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Total amount in Draft & Ready for Payment bills
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-medium">Payment History</h3>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select 
                value={statusFilter || "all"} 
                onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8" />
                          <div>
                            <p className="font-medium">{payment.recipient}</p>
                            {payment.recipient_email && (
                              <p className="text-sm text-muted-foreground">{payment.recipient_email}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {payment.payment_reference || "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
