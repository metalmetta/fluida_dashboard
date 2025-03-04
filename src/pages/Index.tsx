import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Building2, Plus, PiggyBank, TrendingUp, LineChart as LucideLineChart } from "lucide-react";
import { AreaChart, ResponsiveContainer, Area, Tooltip, CartesianGrid, XAxis, YAxis } from "recharts";
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
  EU: "EUR"
};

const cashflowData = [
  { month: 'Jun', amount: 3200 },
  { month: 'Jul', amount: 4500 },
  { month: 'Aug', amount: 2800 },
  { month: 'Sep', amount: 7200 },
  { month: 'Oct', amount: 7800 },
  { month: 'Nov', amount: 11500 },
  { month: 'Dec', amount: 9000 },
  { month: 'Jan', amount: 14000 },
  { month: 'Feb', amount: 15000 },
  { month: 'Mar', amount: 16500 },
  { month: 'Apr', amount: 18000 },
  { month: 'May', amount: 17200 }
];

const BankAccountCard = ({ bank }) => (
  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary/50 transition-colors">
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
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: bank.currency }).format(bank.balance)}
    </p>
  </div>
);

const TopUpCard = ({ topUp }) => (
  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-full bg-primary/10">
        <ArrowUpRight className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="font-medium">Top-up from {topUp.bank_accounts?.name}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(topUp.created_at).toLocaleDateString()} • Ref: {topUp.transaction_reference}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <p className="font-medium">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: topUp.bank_accounts?.currency || 'USD' }).format(topUp.amount)}
      </p>
      <Badge variant={topUp.status === 'completed' ? "success" : "secondary"} className={cn(
        topUp.status === 'pending' && "bg-yellow-100 text-yellow-800",
        topUp.status === 'completed' && "bg-green-100 text-green-800",
        topUp.status === 'failed' && "bg-red-100 text-red-800"
      )}>
        {topUp.status}
      </Badge>
    </div>
  </div>
);

const Index = () => {
  const { session } = useAuth();
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  const [isAddBankDialogOpen, setIsAddBankDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase.from('bank_accounts').select('*').order('created_at', { ascending: true });
      if (error) {
        toast.error("Error loading bank accounts");
        throw error;
      }
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: topUps = [] } = useQuery<TopUp[]>({
    queryKey: ['topUps'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase.from('top_ups').select('*, bank_accounts(name, currency)').order('created_at', { ascending: false }).limit(5);
      if (error) {
        toast.error("Error loading top-up history");
        throw error;
      }
      return data as TopUp[];
    },
    enabled: !!session?.user?.id
  });

  const totalBalance = bankAccounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const changePercentage = 15.3;
  const earnPercentage = 4;
  const earnedAmount = 262.11;

  const handleTopUp = async () => {
    if (!selectedBankId || !topUpAmount || !session?.user?.id) {
      if (!session?.user?.id) {
        toast.error("You must be logged in to perform this action");
      }
      return;
    }
    try {
      const selectedBank = bankAccounts.find(bank => bank.id === selectedBankId);
      if (!selectedBank) {
        toast.error("Selected bank account not found");
        return;
      }
      const { data: topUpData, error: topUpError } = await supabase.from('top_ups').insert([{
        user_id: session.user.id,
        bank_account_id: selectedBankId,
        amount: parseFloat(topUpAmount),
        currency: selectedBank.currency,
        status: 'pending',
        transaction_reference: `TOP-${Date.now()}`
      }]).select().single();
      if (topUpError) throw topUpError;

      await supabase.from('actions').insert([{
        type: 'Top-up',
        amount: parseFloat(topUpAmount),
        status: 'pending',
        approvals_required: 2,
        approvals_received: 0,
        user_id: session.user.id,
        top_up_id: topUpData.id
      }]);

      toast.success("Top-up request submitted");
      setIsTopUpDialogOpen(false);
      setSelectedBankId("");
      setTopUpAmount("");
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      queryClient.invalidateQueries({ queryKey: ['topUps'] });
    } catch (error: any) {
      toast.error("Error processing top-up");
      console.error(error);
    }
  };

  const handleAddBank = async () => {
    if (!selectedCountry || !session?.user?.id) {
      if (!session?.user?.id) {
        toast.error("You must be logged in to add a bank account");
      }
      return;
    }
    try {
      const currency = COUNTRY_CURRENCY_MAP[selectedCountry as keyof typeof COUNTRY_CURRENCY_MAP];
      const accountNumber = Math.floor(1000 + Math.random() * 9000).toString();
      const { data, error } = await supabase.from('bank_accounts').insert([{
        name: `Bank ${bankAccounts.length + 1}`,
        account_number: accountNumber,
        balance: 0,
        currency,
        user_id: session.user.id
      }]).select();
      if (error) {
        console.error("Bank account creation error:", error);
        throw error;
      }
      toast.success("Bank account added successfully");
      setIsAddBankDialogOpen(false);
      setSelectedCountry("");
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    } catch (error: any) {
      toast.error("Error adding bank account");
      console.error(error);
    }
  };

  if (!session?.user?.id) {
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
                      {bankAccounts.map(bank => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name} (ending in {bank.account_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="Enter amount" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} />
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

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 text-white md:col-span-1 bg-slate-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-full bg-gray-800">
                <PiggyBank className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium text-slate-950">Balance</h3>
            </div>
            <p className="text-4xl font-bold mb-2 text-zinc-950">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="mr-1">{changePercentage}%</span>
              <span className="text-gray-300 text-sm">increased vs last month</span>
            </div>
          </Card>

          <Card className="p-6 text-white md:col-span-1 bg-slate-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-full bg-gray-800">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium text-zinc-950">Earn</h3>
            </div>
            <p className="text-4xl font-bold mb-2 text-gray-950">{earnPercentage}%</p>
            <div className="text-green-400">
              <span className="mr-1">${earnedAmount}</span>
              <span className="text-gray-300 text-sm">earned</span>
            </div>
          </Card>

          <Card className="p-6 text-white md:col-span-1 lg:col-span-3 bg-slate-50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gray-800">
                  <LucideLineChart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-950">Cash Flow Position</h3>
              </div>
              <div className="flex items-center text-green-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="mr-1">{changePercentage}%</span>
                <span className="text-sm text-gray-500">increased vs last month</span>
              </div>
            </div>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflowData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444444" vertical={false} />
                  <XAxis dataKey="month" stroke="#888888" />
                  <YAxis stroke="#888888" tickFormatter={value => value === 0 ? `$0k` : `$${value / 1000}k`} />
                  <Tooltip formatter={value => [`$${value}`, 'Amount']} contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                  <Area type="monotone" dataKey="amount" stroke="#4ade80" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} dot={{ stroke: '#4ade80', strokeWidth: 2, r: 4, fill: '#333' }} activeDot={{ stroke: '#4ade80', strokeWidth: 2, r: 6, fill: '#333' }} />
                </AreaChart>
              </ResponsiveContainer>
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
            {bankAccounts.map(bank => <BankAccountCard key={bank.id} bank={bank} />)}
            {bankAccounts.length === 0 && <div className="flex items-center justify-center py-8 text-muted-foreground">No bank accounts linked</div>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Recent Top-ups</h3>
          <div className="space-y-4">
            {topUps.map(topUp => <TopUpCard key={topUp.id} topUp={topUp} />)}
            {topUps.length === 0 && <div className="flex items-center justify-center py-8 text-muted-foreground">No recent top-ups</div>}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;