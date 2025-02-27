import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ArrowUpRight, Building2, Plus } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis } from "recharts";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const data = [
  { day: "Jan 13", value: 456789 },
  { day: "Jan 14", value: 892345 },
  { day: "Jan 15", value: 234567 },
  { day: "Jan 16", value: 789012 },
  { day: "Jan 17", value: 345678 },
  { day: "Jan 18", value: 901234 },
  { day: "Jan 19", value: 567890 },
  { day: "Jan 20", value: 123456 },
  { day: "Jan 21", value: 678901 },
  { day: "Jan 22", value: 432109 },
  { day: "Jan 23", value: 876543 },
];

const actions = [
  {
    type: "Contractor Payout",
    amount: "244.00 USDC",
    status: "2/2 approved",
    icon: ArrowUpRight,
  },
  {
    type: "Withdraw to Bank",
    amount: "1,500.00 USDC",
    status: "0/2 approved",
    icon: Building2,
  },
];

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
  const [bankAccounts, setBankAccounts] = useState([
    { id: "1", name: "Chase Bank", accountNumber: "4589", balance: 45230.00, currency: "USD" },
    { id: "2", name: "Bank of America", accountNumber: "7823", balance: 12845.50, currency: "USD" },
    { id: "3", name: "Wells Fargo", accountNumber: "1234", balance: 28670.25, currency: "USD" },
  ]);

  const handleTopUp = () => {
    if (!selectedBankId || !topUpAmount) return;
    console.log(`Top-up ${topUpAmount} from bank account ${selectedBankId}`);
    setIsTopUpDialogOpen(false);
    setSelectedBankId("");
    setTopUpAmount("");
  };

  const handleAddBank = () => {
    if (!selectedCountry) return;
    const currency = COUNTRY_CURRENCY_MAP[selectedCountry as keyof typeof COUNTRY_CURRENCY_MAP];
    const newBank = {
      id: `${bankAccounts.length + 1}`,
      name: `Bank ${bankAccounts.length + 1}`,
      accountNumber: Math.floor(1000 + Math.random() * 9000).toString(),
      balance: 0,
      currency,
    };
    setBankAccounts([...bankAccounts, newBank]);
    setIsAddBankDialogOpen(false);
    setSelectedCountry("");
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
                          {bank.name} (ending in {bank.accountNumber})
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
            <p className="text-3xl font-semibold mb-6">$1,200,234.00</p>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
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
              {actions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <action.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{action.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {action.amount}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={action.status.includes("2/2") ? "success" : "outline"}
                  >
                    {action.status}
                  </Badge>
                </div>
              ))}
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
                      Account ending in {bank.accountNumber} • {bank.currency}
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
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
