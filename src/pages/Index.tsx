
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { 
  ArrowUpRight, 
  Building2, 
  Wallet, 
  ArrowUp, 
  ArrowDown, 
  Loader2, 
  CreditCard
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useTransactions } from "@/hooks/useTransactions";
import { DepositDialog } from "@/components/DepositDialog";
import { WithdrawDialog } from "@/components/WithdrawDialog";
import { TopUpBalanceDialog } from "@/components/TopUpBalanceDialog";
import { formatCurrency } from "@/lib/utils";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

type TimeScale = 'week' | 'month' | '3months';

const Index = () => {
  const { user } = useAuth();
  const { balance, isLoading, updateBalance } = useUserBalance();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [timeScale, setTimeScale] = useState<TimeScale>('week');
  
  const userName = user?.user_metadata?.full_name || "there";
  
  // Get recent transactions limited to 3
  const recentTransactions = transactions.slice(0, 3);

  // Generate balance chart data based on selected time scale
  const balanceData = useMemo(() => {
    if (transactions.length === 0 || !balance) return [];

    // Sort transactions by date (oldest first)
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );

    // Get the earliest date based on selected time scale
    const now = new Date();
    const startDate = new Date(now);
    
    // Set appropriate time range based on selected scale
    if (timeScale === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeScale === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeScale === '3months') {
      startDate.setMonth(startDate.getMonth() - 3);
    }
    
    // Filter transactions within the selected date range
    const filteredTransactions = sortedTransactions.filter(tx => 
      new Date(tx.transaction_date) >= startDate
    );
    
    // Create appropriate data points based on time scale
    const dataPoints = [];
    let runningBalance = balance.available_amount;
    
    // Start by subtracting all filtered transaction amounts to get the initial balance
    for (const tx of filteredTransactions) {
      if (tx.type === 'Deposit') {
        runningBalance -= tx.amount;
      } else if (tx.type === 'Withdraw') {
        runningBalance += tx.amount;
      }
    }

    // Determine intervals and format based on time scale
    let intervals: Date[] = [];
    
    if (timeScale === 'week') {
      // Daily intervals for a week
      for (let i = 0; i <= 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        intervals.unshift(date);
      }
    } else if (timeScale === 'month') {
      // Weekly intervals for a month
      for (let i = 0; i <= 4; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        intervals.unshift(date);
      }
    } else if (timeScale === '3months') {
      // Bi-weekly intervals for 3 months
      for (let i = 0; i <= 6; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 14));
        intervals.unshift(date);
      }
    }
    
    // Create data points for each interval
    for (let i = 0; i < intervals.length - 1; i++) {
      const intervalStart = intervals[i];
      const intervalEnd = intervals[i + 1];
      
      // Calculate transactions within this interval
      const intervalTransactions = filteredTransactions.filter(tx => {
        const txDate = new Date(tx.transaction_date);
        return txDate >= intervalStart && txDate < intervalEnd;
      });
      
      // Calculate interval's balance change
      let intervalAmount = 0;
      for (const tx of intervalTransactions) {
        if (tx.type === 'Deposit') {
          intervalAmount += tx.amount;
        } else if (tx.type === 'Withdraw') {
          intervalAmount -= tx.amount;
        }
      }
      
      // Adjust running balance for next interval
      if (i !== intervals.length - 2) { // Skip current interval as it's already in final balance
        runningBalance += intervalAmount;
      }
      
      // Format date based on time scale
      let dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      
      const formattedDate = intervalStart.toLocaleDateString('en-US', dateFormat);
      
      dataPoints.push({
        date: formattedDate,
        balance: runningBalance,
      });
      
      // Reset for next interval
      runningBalance -= intervalAmount;
    }
    
    // Add the most recent point (today)
    dataPoints.push({
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: balance.available_amount,
    });
    
    return dataPoints;
  }, [transactions, balance, timeScale]);

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
        return <ArrowUpRight />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Welcome back, {userName}</h1>
            <p className="text-muted-foreground">Here's your financial overview</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Balance</h3>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setDepositDialogOpen(true)}
                >
                  <ArrowDown className="mr-1 h-4 w-4" />
                  Deposit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setWithdrawDialogOpen(true)}
                  disabled={!balance || balance.available_amount <= 0}
                >
                  <ArrowUp className="mr-1 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : (
              <>
                <div className="flex items-end gap-2 mb-6">
                  <p className="text-3xl font-semibold">
                    {balance 
                      ? formatCurrency(balance.available_amount, balance.currency)
                      : "$0.00"
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">Available balance</p>
                </div>
                
                <div className="flex justify-end mb-4">
                  <ToggleGroup 
                    type="single" 
                    value={timeScale}
                    onValueChange={(value) => {
                      if (value) setTimeScale(value as TimeScale);
                    }}
                  >
                    <ToggleGroupItem value="week">Week</ToggleGroupItem>
                    <ToggleGroupItem value="month">Month</ToggleGroupItem>
                    <ToggleGroupItem value="3months">3 Months</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <div className="h-[200px] w-full">
                  <ChartContainer
                    config={{
                      balance: {
                        label: "Balance",
                        theme: {
                          light: "hsl(var(--primary))",
                          dark: "hsl(var(--primary))"
                        }
                      }
                    }}
                  >
                    {balanceData.length > 0 ? (
                      <LineChart data={balanceData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                        <XAxis 
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                          tickMargin={8}
                        />
                        <YAxis 
                          hide={true}
                          domain={['dataMin - 1000', 'dataMax + 1000']}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        Date
                                      </span>
                                      <span className="font-bold text-xs">
                                        {payload[0].payload.date}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        Balance
                                      </span>
                                      <span className="font-bold text-xs">
                                        {formatCurrency(
                                          payload[0].value as number,
                                          balance?.currency || "USD"
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="balance"
                          name="balance"
                          stroke="var(--color-balance)"
                          strokeWidth={2}
                          dot={{
                            r: 4,
                            strokeWidth: 2,
                            fill: "var(--background)"
                          }}
                          activeDot={{
                            r: 6,
                            strokeWidth: 3
                          }}
                        />
                      </LineChart>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-muted-foreground">No balance history data available</p>
                      </div>
                    )}
                  </ChartContainer>
                </div>
              </>
            )}
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

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
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
        </Card>
      </div>

      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
      />

      <WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        onWithdraw={(amount) => updateBalance(-Math.abs(amount), 'Withdraw', 'Withdrawal from account')}
        currentBalance={balance?.available_amount || 0}
        currentCurrency={balance?.currency || "USD"}
      />

      <TopUpBalanceDialog
        open={topUpDialogOpen}
        onOpenChange={setTopUpDialogOpen}
        onTopUp={(amount) => updateBalance(amount, 'Deposit', 'Deposit to account')}
        currentCurrency={balance?.currency || "USD"}
      />
    </DashboardLayout>
  );
};

export default Index;
