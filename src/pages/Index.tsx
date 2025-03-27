import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  ArrowUpRight, 
  Building2, 
  Wallet, 
  ArrowUp, 
  ArrowDown, 
  CreditCard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useTransactions } from "@/hooks/useTransactions";
import { useUserActions } from "@/hooks/useUserActions";
import { DepositDialog } from "@/components/DepositDialog";
import { WithdrawDialog } from "@/components/WithdrawDialog";
import { TopUpBalanceDialog } from "@/components/TopUpBalanceDialog";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { PendingActionsCard } from "@/components/dashboard/PendingActionsCard";
import { TransactionsCard } from "@/components/dashboard/TransactionsCard";

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
  
  const userName = user?.user_metadata?.full_name || "there";
  
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
          <BalanceCard 
            isLoading={isLoading}
            balance={balance}
            balanceData={balanceData}
            timeScale={timeScale}
            setTimeScale={setTimeScale}
            onDepositClick={() => setDepositDialogOpen(true)}
            onWithdrawClick={() => setWithdrawDialogOpen(true)}
          />

          <PendingActionsCard 
            actions={actions}
            isLoading={actionsLoading}
            getActionIcon={getActionIcon}
          />
        </div>

        <TransactionsCard 
          transactions={transactions}
          isLoading={transactionsLoading}
        />
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
