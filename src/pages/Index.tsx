
import { useState } from "react";
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
import { useProfileData } from "@/hooks/useProfileData";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const Index = () => {
  const { user } = useAuth();
  const { balance, isLoading, updateBalance } = useUserBalance();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { actions, isLoading: actionsLoading } = useUserActions();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const { profileData, loading: profileLoading } = useProfileData();
  
  const userName = user?.user_metadata?.full_name || "there";
  const companyName = profileData?.companyName || "";
  
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

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Welcome back, {userName}</h1>
            <p className="text-muted-foreground">Here's your financial overview</p>
          </div>
          {companyName && !profileLoading && (
            <div className="text-right">
              <p className="text-lg font-medium">
                <Badge className="bg-blue-500 hover:bg-blue-600">{companyName}</Badge>
              </p>
            </div>
          )}
        </div>

        <Card className="p-6 mb-6">
          <p className="text-sm text-muted-foreground">Track your account balance, pending actions, and recent transactions.</p>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <BalanceCard 
            isLoading={isLoading}
            balance={balance}
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
