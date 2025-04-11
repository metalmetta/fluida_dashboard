
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, AlertCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWallet } from "@/hooks/useWallet";
import { WalletDisplay } from "@/components/wallet/WalletDisplay";
import { CreateWalletButton } from "@/components/wallet/CreateWalletButton";

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
  const { wallet, isCreating, createWallet } = useWallet();

  const handleCreateWallet = async () => {
    await createWallet();
  };

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
          <>
            <div className="flex items-end gap-2 mb-6">
              <p className="text-3xl font-semibold">
                {balance 
                  ? formatCurrency(balance.available_amount, balance.currency)
                  : "$0.00"
                }
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto mb-1" aria-label="Balance information">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Fluida uses digital currency. When you add money to Fluida, it's automatically converted to a stablecoin called USDC.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-muted-foreground mb-1">Available balance</p>
            </div>
            
            {wallet ? (
              <WalletDisplay wallet={wallet} />
            ) : (
              <CreateWalletButton 
                isCreating={isCreating} 
                onClick={handleCreateWallet} 
              />
            )}
          </>
        )}
      </div>
    </Card>
  );
}
