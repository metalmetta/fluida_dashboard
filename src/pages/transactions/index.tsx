import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Search, Plus, ArrowUpRight, CreditCard } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  approvals_required: number;
  approvals_received: number;
  created_at: string;
  top_up_id?: string;
  bill_id?: string;
  top_up?: {
    bank_account: {
      name: string;
      currency: string;
    };
  };
  bill?: {
    bill_number: string;
    vendors?: {
      name: string;
    };
  };
}

export default function Transactions() {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");

  // Fetch transactions with related data
  const { data: transactions = [], refetch } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
        .from('actions')
        .select(`
          *,
          top_up:top_ups (
            bank_account:bank_accounts (
              name,
              currency
            )
          ),
          bill:bills (
            bill_number,
            vendors (
              name
            )
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: sortOrder === "asc" });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        toast.error("Error loading transactions");
        throw error;
      }
      return data;
    },
    enabled: !!session?.user?.id
  });

  const filteredTransactions = transactions.filter(transaction => 
    transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSort = () => {
    setSortOrder(current => current === "asc" ? "desc" : "asc");
  };

  const handleNewTransaction = async () => {
    if (!amount || !type || !session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('actions')
        .insert([{
          type,
          amount: parseFloat(amount),
          status: 'pending',
          approvals_required: 2,
          approvals_received: 0,
          user_id: session.user.id
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Top-up':
        return <ArrowUpRight className="h-4 w-4 text-primary" />;
      case 'Bill Payment':
        return <CreditCard className="h-4 w-4 text-primary" />;
      default:
        return <ArrowUpDown className="h-4 w-4 text-primary" />;
    }
  };

  const getTransactionDetails = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'Top-up':
        return transaction.top_up?.bank_account?.name 
          ? `From ${transaction.top_up.bank_account.name}`
          : 'Bank top-up';
      case 'Bill Payment':
        return transaction.bill
          ? `Bill ${transaction.bill.bill_number} to ${transaction.bill.vendors?.name || 'Unknown Vendor'}`
          : 'Bill payment';
      default:
        return transaction.type;
    }
  };

  const getBadgeVariant = (status: string, approvals_received: number, approvals_required: number) => {
    if (status === 'completed' || approvals_received === approvals_required) {
      return 'success';
    }
    return status === 'pending' ? 'secondary' : 'destructive';
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
          <div className="p-6 space-y-6">
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
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{getTransactionDetails(transaction)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium text-right">
                      ${transaction.amount.toFixed(2)}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {transaction.top_up?.bank_account?.currency || 'USD'}
                      </span>
                    </p>
                    <Badge 
                      variant={getBadgeVariant(
                        transaction.status,
                        transaction.approvals_received,
                        transaction.approvals_required
                      )}
                      className={cn(
                        transaction.status === 'pending' && "bg-yellow-100 text-yellow-800",
                        transaction.status === 'completed' && "bg-green-100 text-green-800",
                        transaction.status === 'failed' && "bg-red-100 text-red-800"
                      )}
                    >
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
