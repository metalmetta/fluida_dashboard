
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Search, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");

  // Fetch transactions
  const { data: transactions = [], refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .order('created_at', { ascending: sortOrder === "asc" });
      
      if (error) {
        toast.error("Error loading transactions");
        throw error;
      }
      return data;
    }
  });

  const filteredTransactions = transactions.filter(transaction => 
    transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSort = () => {
    setSortOrder(current => current === "asc" ? "desc" : "asc");
  };

  const handleNewTransaction = async () => {
    if (!amount || !type) return;

    try {
      const { error } = await supabase
        .from('actions')
        .insert([{
          type,
          amount: parseFloat(amount),
          status: 'pending',
          approvals_required: 2,
          approvals_received: 0
        }]);

      if (error) throw error;

      toast.success("Transaction created successfully");
      setIsNewTransactionOpen(false);
      setAmount("");
      setType("");
      refetch();
    } catch (error: any) {
      toast.error("Error creating transaction");
      console.error(error);
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Transactions</h1>
          <Dialog open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Transaction</DialogTitle>
                <DialogDescription>
                  Enter the transaction details below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Top-up">Top-up</SelectItem>
                      <SelectItem value="Withdraw to Bank">Withdraw to Bank</SelectItem>
                      <SelectItem value="Contractor Payout">Contractor Payout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleNewTransaction} disabled={!amount || !type}>
                  Create Transaction
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleSort}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort {sortOrder === "asc" ? "Newest" : "Oldest"}
              </Button>
            </div>

            <div className="divide-y">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.id} • {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                    <Badge variant={getBadgeVariant(transaction.status)}>
                      {transaction.approvals_received}/{transaction.approvals_required} approved
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredTransactions.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No transactions found
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
