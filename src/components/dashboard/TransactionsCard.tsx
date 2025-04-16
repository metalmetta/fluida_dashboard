
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowDown, ArrowUp, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  type: 'Deposit' | 'Withdraw' | 'Payment';
  amount: number;
  currency: string;
  description?: string;
  transaction_date: string;
}

interface TransactionsCardProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function TransactionsCard({ transactions, isLoading }: TransactionsCardProps) {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  const recentTransactions = showAllTransactions 
    ? transactions 
    : transactions.slice(0, 3);

  // Helper function for transaction icons
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Deposit':
        return <ArrowDown className="w-4 h-4 text-green-600" />;
      case 'Withdraw':
        return <ArrowUp className="w-4 h-4 text-red-600" />;
      default:
        return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-secondary/70">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.description || 'Transaction'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${transaction.type === 'Deposit' ? 'text-green-600' : transaction.type === 'Withdraw' ? 'text-red-600' : ''}`}>
                    {transaction.type === 'Withdraw' ? '-' : ''}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}
      </CardContent>
      {transactions.length > 3 && !showAllTransactions && (
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowAllTransactions(true)}
          >
            Show all transactions
          </Button>
        </CardFooter>
      )}
      {showAllTransactions && transactions.length > 3 && (
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowAllTransactions(false)}
          >
            Show less
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
