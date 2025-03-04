import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Building2, Plus, PiggyBank, TrendingUp, LineChart as LucideLineChart, Send, ArrowDownToLine, ArrowUpFromLine, FileText, Receipt, Settings, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Database } from "@/types/database.types";

type TopUp = Database['public']['Tables']['top_ups']['Row'] & {
  bank_accounts: {
    name: string;
    currency: string;
  } | null;
};

type Task = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  amount: number;
  created_at: string;
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

const depositFormSchema = z.object({
  bankId: z.string().min(1, "Please select a bank account"),
  amount: z.string().min(1, "Please enter an amount").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Please enter a valid positive amount"
  ),
});

type DepositFormValues = z.infer<typeof depositFormSchema>;

const AccountCard = ({ name, balance }: { name: string; balance: number }) => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/10 cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">Balance</p>
          </div>
        </div>
        <p className="font-medium">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </HoverCardTrigger>
    <HoverCardContent>
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">{name}</h4>
        <div className="text-sm">
          <p className="text-muted-foreground">Last transaction: Today</p>
          <p className="text-muted-foreground">Status: Active</p>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
);

const TaskCard = ({ task }: { task: Task }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-secondary">
          {getStatusIcon(task.status)}
        </div>
        <div>
          <p className="font-medium">{task.title}</p>
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </div>
      </div>
      {task.amount && (
        <p className="font-medium">
          ${task.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      )}
    </div>
  );
};

const Index = () => {
  const { session } = useAuth();
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  const [isAddBankDialogOpen, setIsAddBankDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const queryClient = useQueryClient();

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      bankId: "",
      amount: "",
    },
  });

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

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Error loading tasks");
        throw error;
      }
      return data;
    },
    enabled: !!session?.user?.id
  });

  const totalBalance = bankAccounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const changePercentage = 15.3;
  const earnPercentage = 4;
  const earnedAmount = 262.11;

  const onSubmit = async (data: DepositFormValues) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to perform this action");
      return;
    }

    try {
      const selectedBank = bankAccounts.find(bank => bank.id === data.bankId);
      if (!selectedBank) {
        toast.error("Selected bank account not found");
        return;
      }

      const amount = parseFloat(data.amount);

      const { data: topUpData, error: topUpError } = await supabase.from('top_ups').insert([{
        user_id: session.user.id,
        bank_account_id: data.bankId,
        amount,
        currency: selectedBank.currency,
        status: 'pending',
        transaction_reference: `TOP-${Date.now()}`
      }]).select().single();

      if (topUpError) throw topUpError;

      await supabase.from('actions').insert([{
        type: 'Top-up',
        amount,
        status: 'pending',
        approvals_required: 2,
        approvals_received: 0,
        user_id: session.user.id,
        top_up_id: topUpData.id
      }]);

      toast.success("Deposit request submitted");
      setIsTopUpDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      queryClient.invalidateQueries({ queryKey: ['topUps'] });
    } catch (error: any) {
      toast.error("Error processing deposit");
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
        <div>
          <h1 className="text-3xl font-semibold mb-6">Welcome, Jane</h1>
          <div className="flex gap-2 mb-8">
            <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4" />
                  Deposit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Deposit to Account</DialogTitle>
                <DialogDescription>
                  Select a bank account and enter the amount you want to deposit.
                </DialogDescription>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bankId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Account</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a bank account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bankAccounts.map(bank => (
                                <SelectItem key={bank.id} value={bank.id}>
                                  {bank.name} (ending in {bank.account_number})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter amount" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Confirm Deposit</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowUpFromLine className="h-4 w-4" />
              Withdraw
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Pay Bill
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Create Bill
            </Button>
            <Button variant="outline" className="ml-auto">
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Mercury balance</CardTitle>
              <PiggyBank className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-4xl font-bold">$5,144,707.08</p>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="text-green-500">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +$1.7M
                  </Badge>
                  <Badge variant="secondary" className="text-red-500">
                    -$412K
                  </Badge>
                </div>
                <div className="h-[200px] w-full">
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
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Tasks</CardTitle>
              <Badge variant="secondary" className="font-mono">
                {tasks.length} pending
              </Badge>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {tasks.length === 0 && (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      No pending tasks
                    </div>
                  )}
                </div>
              </ScrollArea>
              {tasks.length > 0 && (
                <Button variant="outline" className="w-full mt-4">
                  View all tasks
                </Button>
              )}
            </CardContent>
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