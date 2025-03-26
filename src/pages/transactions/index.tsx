
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpDown, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  CreditCard,
  Loader2 
} from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils";

export default function Transactions() {
  const { transactions, isLoading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Icon mapping for transaction types
  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'Deposit':
        return <ArrowDown className="text-green-500" />;
      case 'Withdraw':
        return <ArrowUp className="text-red-500" />;
      case 'Payment':
        return <CreditCard className="text-blue-500" />;
      default:
        return null;
    }
  };

  // Get badge variant based on transaction type
  const getBadgeVariant = (type: string) => {
    switch(type) {
      case 'Deposit':
        return "success";
      case 'Withdraw':
        return "destructive";
      case 'Payment':
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Transactions</h1>
        </div>

        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="divide-y">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-secondary/70">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || 'Transaction'} • {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-medium ${transaction.type === 'Deposit' ? 'text-green-600' : transaction.type === 'Withdraw' ? 'text-red-600' : ''}`}>
                        {transaction.type === 'Withdraw' ? '-' : ''}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <Badge variant={getBadgeVariant(transaction.type)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
