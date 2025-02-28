
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

const COUNTRY_CURRENCY_MAP = {
  US: "USD",
  CA: "CAD",
  UK: "GBP",
  EU: "EUR",
};

const Index = () => {
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  const [isAddBankDialogOpen, setIsAddBankDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const queryClient = useQueryClient();

  // Fetch bank accounts
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        toast.error("Error loading bank accounts");
        throw error;
      }
      return data;
    }
  });

  // Fetch actions
  const { data: actions = [] } = useQuery({
    queryKey: ['actions'],
    queryFn: async () => {
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
    }
  });

  // Calculate total balance
  const totalBalance = bankAccounts.reduce((sum, account) => sum + Number(account.balance), 0);

  // Generate chart data from bank accounts total over time
  const chartData = bankAccounts.map((account, index) => ({
    day: `Account ${index + 1}`,
    value: account.balance
  }));

  const handleTopUp = async () => {
    if (!selectedBankId || !topUpAmount) return;
    
    try {
      // Insert a new action record for the top-up
      const { error: actionError } = await supabase
        .from('actions')
        .insert([{
          type: 'Top-up',
          amount: parseFloat(topUpAmount),
          status: 'pending',
          approvals_required: 2,
          approvals_received: 0
        }]);

      if (actionError) throw actionError;
      
      toast.success("Top-up request submitted");
      setIsTopUpDialogOpen(false);
      setSelectedBankId("");
      setTopUpAmount("");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    } catch (error: any) {
      toast.error("Error processing top-up");
      console.error(error);
    }
  };

  const handleAddBank = async () => {
    if (!selectedCountry) return;
    
    try {
      // Get currency for selected country
      const currency = COUNTRY_CURRENCY_MAP[selectedCountry as keyof typeof COUNTRY_CURRENCY_MAP];
      
      // Generate random account number
      const accountNumber = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Insert a new bank_account record in Supabase
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([{
          name: `Bank ${bankAccounts.length + 1}`,
          account_number: accountNumber,
          balance: 0,
          currency
        }])
        .select();

      if (error) throw error;
      
      toast.success("Bank account added successfully");
      setIsAddBankDialogOpen(false);
      setSelectedCountry("");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    } catch (error: any) {
      toast.error("Error adding bank account");
      console.error(error);
    }
  };

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
            <Dialog open={isAddBankDialogOpen} onOpenChange={setIsAddBankDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bank Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Add New Bank Account</DialogTitle>
                <DialogDescription>
                  Select your country to connect a new bank account.
                </DialogDescription>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States (USD)</SelectItem>
                        <SelectItem value="CA">Canada (CAD)</SelectItem>
                        <SelectItem value="UK">United Kingdom (GBP)</SelectItem>
                        <SelectItem value="EU">European Union (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddBank} disabled={!selectedCountry}>
                    Add Bank Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
      </div>
    </DashboardLayout>
  );
};

export default Index;
