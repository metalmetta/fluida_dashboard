import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Building2, Plus } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis } from "recharts";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";
import { Database } from "@/types/database.types";
import { PlaidLink } from '@/components/PlaidLink';

type TopUp = Database['public']['Tables']['top_ups']['Row'] & {
  bank_accounts: {
    name: string;
    currency: string;
  } | null;
};

const COUNTRY_CURRENCY_MAP = {
  US: "USD",
  CA: "CAD",
  UK: "GBP",
  EU: "EUR",
};

const Index = () => {
  const { session } = useAuth();
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const queryClient = useQueryClient();

  // Fetch bank accounts
  const { data: bankAccounts = [], refetch: refetchBankAccounts } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        toast.error("Error loading bank accounts");
        throw error;
      }
      return data;
    },
    enabled: !!session?.user?.id
  });

  // Fetch actions
  const { data: actions = [] } = useQuery({
    queryKey: ['actions'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        toast.error("Error loading actions");
        throw error;
      }
      return data.map(action => ({
        ...action,
        icon: action.type.includes('Withdraw') ? Building2 : ArrowUpRight,
        status: `${action.approvals_received}/${action.approvals_required} approved`
      }));
    },
    enabled: !!session?.user?.id
  });

  // Fetch top-ups
  const { data: topUps = [] } = useQuery<TopUp[]>({
    queryKey: ['topUps'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('top_ups')
        .select('*, bank_accounts(name, currency)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        toast.error("Error loading top-up history");
        throw error;
      }
      return data as TopUp[];
    },
    enabled: !!session?.user?.id
  });

  // Calculate total balance
  const totalBalance = bankAccounts.reduce((sum, account) => sum + Number(account.balance), 0);

  // Generate chart data from bank accounts total over time
  const chartData = bankAccounts.map((account, index) => ({
    day: `Account ${index + 1}`,
    value: account.balance
  }));

  const handleTopUp = async () => {
    if (!selectedBankId || !topUpAmount || !session?.user?.id) {
      if (!session?.user?.id) {
        toast.error("You must be logged in to perform this action");
      }
      return;
    }
    
    try {
      // Get the selected bank account for currency info
      const selectedBank = bankAccounts.find(bank => bank.id === selectedBankId);
      if (!selectedBank) {
        toast.error("Selected bank account not found");
        return;
      }

      // Create a new top-up record
      const { data: topUpData, error: topUpError } = await supabase
        .from('top_ups')
        .insert([{
          user_id: session.user.id,
          bank_account_id: selectedBankId,
          amount: parseFloat(topUpAmount),
          currency: selectedBank.currency,
          status: 'pending',
          transaction_reference: `TOP-${Date.now()}`
        }])
        .select()
        .single();

      if (topUpError) throw topUpError;

      // Create an action record for approval tracking
      const { error: actionError } = await supabase
        .from('actions')
        .insert([{
          type: 'Top-up',
          amount: parseFloat(topUpAmount),
          status: 'pending',
          approvals_required: 2,
          approvals_received: 0,
          user_id: session.user.id,
          top_up_id: topUpData.id
        }]);

      if (actionError) throw actionError;
      
      toast.success("Top-up request submitted");
      setIsTopUpDialogOpen(false);
      setSelectedBankId("");
      setTopUpAmount("");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      queryClient.invalidateQueries({ queryKey: ['topUps'] });
    } catch (error: any) {
      toast.error("Error processing top-up");
      console.error(error);
    }
  };

  // Check if user is logged in
  const isLoggedIn = !!session?.user?.id;
  if (!isLoggedIn) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <h2 className="text-2xl font-semibold">Please log in</h2>
          <p className="text-muted-foreground">You need to be logged in to view your financial dashboard</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Welcome back</h1>
            <p className="text-muted-foreground">Here's your financial overview</p>
          </div>
          <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">Top-up</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Top-up from Bank Account</DialogTitle>
              <DialogDescription>
                Select a bank account and enter the amount you want to top-up.
              </DialogDescription>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Select Bank Account</Label>
                  <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name} (ending in {bank.account_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleTopUp} disabled={!selectedBankId || !topUpAmount}>
                  Confirm Top-up
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Fluida balance</h3>
            <p className="text-3xl font-semibold mb-6">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="day" hide />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Pending Actions</h3>
            <div className="space-y-4">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <action.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{action.type}</p>
                      <p className="text-sm text-muted-foreground">
                        ${action.amount.toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={action.approvals_received === action.approvals_required ? "success" : "outline"}
                  >
                    {action.status}
                  </Badge>
                </div>
              ))}
              {actions.length === 0 && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No pending actions
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Bank Accounts Linked</h3>
            <PlaidLink
              userId={session?.user?.id || ''}
              onSuccess={(bankAccountId) => {
                refetchBankAccounts();
                toast.success('Bank account linked successfully');
              }}
              className="ml-auto"
            />
          </div>
          <div className="space-y-4">
            {bankAccounts.map((bank) => (
              <div
                key={bank.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{bank.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Account ending in {bank.account_number} • {bank.currency}
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: bank.currency
                  }).format(bank.balance)}
                </p>
              </div>
            ))}
            {bankAccounts.length === 0 && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No bank accounts linked
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Recent Top-ups</h3>
          <div className="space-y-4">
            {topUps.map((topUp) => (
              <div
                key={topUp.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Top-up from {topUp.bank_accounts?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(topUp.created_at).toLocaleDateString()} • Ref: {topUp.transaction_reference}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: topUp.bank_accounts?.currency || 'USD'
                    }).format(topUp.amount)}
                  </p>
                  <Badge
                    variant={topUp.status === 'completed' ? "success" : "secondary"}
                    className={cn(
                      topUp.status === 'pending' && "bg-yellow-100 text-yellow-800",
                      topUp.status === 'completed' && "bg-green-100 text-green-800",
                      topUp.status === 'failed' && "bg-red-100 text-red-800"
                    )}
                  >
                    {topUp.status}
                  </Badge>
                </div>
              </div>
            ))}
            {topUps.length === 0 && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No recent top-ups
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
