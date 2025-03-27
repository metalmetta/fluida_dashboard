import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
import { useUserActions } from "@/hooks/useUserActions";
import { DepositDialog } from "@/components/DepositDialog";
import { WithdrawDialog } from "@/components/WithdrawDialog";
import { TopUpBalanceDialog } from "@/components/TopUpBalanceDialog";
import { formatCurrency } from "@/lib/utils";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type TimeScale = 'week' | 'month' | '3months';

const Index = () => {
  const { user } = useAuth();
  const { balance, isLoading, updateBalance } = useUserBalance();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { actions, isLoading: actionsLoading } = useUserActions();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [timeScale, setTimeScale] = useState<TimeScale>('week');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  const userName = user?.user_metadata?.full_name || "there";
  
  const recentTransactions = showAllTransactions 
    ? transactions 
    : transactions.slice(0, 3);

  const getActionIcon = (iconName: string | null) => {
    const iconMap: Record<string, React.ElementType> = {
      ArrowUpRight: ArrowUpRight,
      Building2: Building2,
      Wallet: Wallet,
      ArrowUp: ArrowUp,
      ArrowDown: ArrowDown,
      CreditCard: CreditCard,
    };
    
    const IconComponent = iconName && iconMap[iconName] ? iconMap[iconName] : ArrowUpRight;
    return IconComponent;
  };

  const balanceData = useMemo(() => {
    if (transactions.length === 0 || !balance) return [];

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );

    const now = new Date();
    const startDate = new Date(now);
    
    if (timeScale === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeScale === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeScale === '3months') {
      startDate.setMonth(startDate.getMonth() - 3);
    }
    
    const filteredTransactions = sortedTransactions.filter(tx => 
      new Date(tx.transaction_date) >= startDate
    );
    
    const dataPoints = [];
    let runningBalance = balance.available_amount;
    
    for (const tx of filteredTransactions) {
      if (tx.type === 'Deposit') {
        runningBalance -= tx.amount;
      } else if (tx.type === 'Withdraw') {
        runningBalance += tx.amount;
      }
    }

    let intervals: Date[] = [];
    
    if (timeScale === 'week') {
      for (let i = 0; i <= 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        intervals.unshift(date);
      }
    } else if (timeScale === 'month') {
      for (let i = 0; i <= 4; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        intervals.unshift(date);
      }
    } else if (timeScale === '3months') {
      for (let i = 0; i <= 6; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 14));
        intervals.unshift(date);
      }
    }
    
    for (let i = 0; i < intervals.length - 1; i++) {
      const intervalStart = intervals[i];
      const intervalEnd = intervals[i + 1];
      
      const intervalTransactions = filteredTransactions.filter(tx => {
        const txDate = new Date(tx.transaction_date);
        return txDate >= intervalStart && txDate < intervalEnd;
      });
      
      let intervalAmount = 0;
      for (const tx of intervalTransactions) {
        if (tx.type === 'Deposit') {
          intervalAmount += tx.amount;
        } else if (tx.type === 'Withdraw') {
          intervalAmount -= tx.amount;
        }
      }
      
      if (i !== intervals.length - 2) {
        runningBalance += intervalAmount;
      }
      
      const dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      
      const formattedDate = intervalStart.toLocaleDateString('en-US', dateFormat);
      
      dataPoints.push({
        date: formattedDate,
        balance: runningBalance,
      });
      
      runningBalance -= intervalAmount;
    }
    
    dataPoints.push({
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: balance.available_amount,
    });
    
    return dataPoints;
  }, [transactions, balance, timeScale]);

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
          <Card>
            <div className="p-6">
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
                      className="border rounded-md bg-background p-1"
                    >
                      <ToggleGroupItem value="week" className="text-xs px-3 py-1 rounded-sm">Week</ToggleGroupItem>
                      <ToggleGroupItem value="month" className="text-xs px-3 py-1 rounded-sm">Month</ToggleGroupItem>
                      <ToggleGroupItem value="3months" className="text-xs px-3 py-1 rounded-sm">3 Months</ToggleGroupItem>
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
                        <LineChart data={balanceData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                          <XAxis 
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
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
                                  <div className="rounded-lg border border-border bg-card p-2 shadow-md">
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
                            strokeWidth={2.5}
                            activeDot={{
                              r: 6,
                              strokeWidth: 0,
                              fill: "var(--color-balance)"
                            }}
                            dot={{
                              r: 0,
                              strokeWidth: 0
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
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Pending Actions</h3>
            {actionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : actions.length > 0 ? (
              <div className="space-y-4">
                {actions.map((action) => {
                  const ActionIcon = getActionIcon(action.icon);
                  return (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <ActionIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{action.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(action.amount, action.currency)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={action.status.includes("2/2") ? "success" : "outline"}
                      >
                        {action.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending actions</p>
              </div>
            )}
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
