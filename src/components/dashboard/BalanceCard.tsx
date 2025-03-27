
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  isLoading: boolean;
  balance: {
    available_amount: number;
    currency: string;
  } | null;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

export function BalanceCard({
  isLoading,
  balance,
  onDepositClick,
  onWithdrawClick
}: BalanceCardProps) {
  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-medium">Balance</h3>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={onDepositClick}
            >
              <ArrowDown className="mr-1 h-4 w-4" />
              Deposit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onWithdrawClick}
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
          <div className="flex items-end gap-2 mb-6">
            <p className="text-3xl font-semibold">
              {balance 
                ? formatCurrency(balance.available_amount, balance.currency)
                : "$0.00"
              }
            </p>
            <p className="text-sm text-muted-foreground mb-1">Available balance</p>
          </div>
        )}
      </div>
    </Card>
  );
}
