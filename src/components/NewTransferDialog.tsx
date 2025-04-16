import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserBalance } from "@/hooks/useUserBalance";
import { usePayments } from "@/hooks/usePayments";
import { PaymentMethod } from "@/types/invoice";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Check, DollarSign, Loader2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { TopUpBalanceDialog } from "@/components/TopUpBalanceDialog";

interface NewTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransferComplete?: () => void;
}

export default function NewTransferDialog({
  open,
  onOpenChange,
  onTransferComplete
}: NewTransferDialogProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [toAccount, setToAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPaymentMethods, setIsFetchingPaymentMethods] = useState(true);
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  
  const { balance, fetchBalance } = useUserBalance();
  const { createInternalTransferPayment } = usePayments();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!user) return;
      
      try {
        setIsFetchingPaymentMethods(true);
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (data) {
          const methods = data.map((item: any) => ({
            id: item.id,
            type: item.type,
            label: item.label,
            details: item.details,
            isDefault: item.is_default
          }));
          setPaymentMethods(methods);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        toast({
          title: "Error",
          description: "Could not load payment methods",
          variant: "destructive"
        });
      } finally {
        setIsFetchingPaymentMethods(false);
      }
    };

    if (open) {
      fetchPaymentMethods();
      setToAccount("");
      setAmount("");
      setReference("");
      setDescription("");
      setInsufficientFunds(false);
    }
  }, [open, user, toast]);

  const handleAmountChange = (value: string) => {
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === '') {
      setAmount(value);
      
      if (balance) {
        const numAmount = parseFloat(value) || 0;
        setInsufficientFunds(numAmount > balance.available_amount);
      }
    }
  };

  const handleTransfer = async () => {
    if (!user || !balance) return;
    
    if (!toAccount) {
      toast({
        title: "Missing information",
        description: "Please select a recipient account",
        variant: "destructive"
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive"
      });
      return;
    }

    if (numAmount > balance.available_amount) {
      setInsufficientFunds(true);
      setTopUpDialogOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      await createInternalTransferPayment({
        amount: numAmount,
        currency: balance.currency,
        fromAccount: "Fluida Balance",
        toAccount: toAccount,
        reference: reference || undefined
      });

      const { error: transferError } = await supabase
        .from("internal_transfers")
        .insert([{
          user_id: user.id,
          amount: numAmount,
          currency: balance.currency,
          from_account: "Fluida Balance",
          to_account: toAccount,
          status: "Completed",
          reference: reference || null,
          description: description || null,
          transfer_date: new Date().toISOString()
        }]);

      if (transferError) throw transferError;

      const { error: balanceError } = await supabase
        .from("user_balances")
        .update({ 
          available_amount: balance.available_amount - numAmount,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Transfer successful",
        description: `Successfully transferred ${formatCurrency(numAmount, balance.currency)} to ${toAccount}`,
      });

      onOpenChange(false);
      fetchBalance();
      onTransferComplete();
    } catch (error) {
      console.error("Error processing transfer:", error);
      toast({
        title: "Transfer failed",
        description: "There was an error processing your transfer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopUpSuccess = async (amount: number) => {
    await fetchBalance();
    setTopUpDialogOpen(false);
    
    if (balance && parseFloat(amount.toString()) <= balance.available_amount) {
      setInsufficientFunds(false);
    }
    
    return true;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Transfer</DialogTitle>
            <DialogDescription>
              Transfer funds from your Fluida balance to your bank accounts.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {balance && (
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium flex items-center">
                    <Wallet className="h-4 w-4 mr-2 text-gray-500" />
                    Available Balance
                  </div>
                  <div className="font-medium">
                    {formatCurrency(balance.available_amount, balance.currency)}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="to-account">To Account</Label>
              <Select
                value={toAccount}
                onValueChange={setToAccount}
                disabled={isFetchingPaymentMethods || isLoading}
              >
                <SelectTrigger id="to-account" className="w-full">
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.length === 0 ? (
                    <SelectItem value="no-accounts" disabled>
                      No payment methods available
                    </SelectItem>
                  ) : (
                    paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.label}>
                        {method.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
              {insufficientFunds && (
                <p className="text-xs text-red-500">
                  Insufficient funds. Please top up your balance.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Transfer reference"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about this transfer"
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            {insufficientFunds ? (
              <Button
                type="button"
                onClick={() => setTopUpDialogOpen(true)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Top Up Balance
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleTransfer}
                disabled={isLoading || !toAccount || !amount}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Transfer
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TopUpBalanceDialog
        open={topUpDialogOpen}
        onOpenChange={setTopUpDialogOpen}
        onTopUp={handleTopUpSuccess}
        currentCurrency={balance?.currency || "USD"}
      />
    </>
  );
}
