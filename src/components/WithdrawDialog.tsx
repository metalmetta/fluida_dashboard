
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWithdraw: (amount: number) => Promise<boolean>;
  currentBalance: number;
  currentCurrency: string;
}

export function WithdrawDialog({ 
  open, 
  onOpenChange,
  onWithdraw,
  currentBalance,
  currentCurrency
}: WithdrawDialogProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers with up to 2 decimal places
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(amount) > currentBalance) {
      toast({
        title: "Insufficient funds",
        description: `You can withdraw a maximum of ${formatCurrency(currentBalance, currentCurrency)}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onWithdraw(-parseFloat(amount));
      if (success) {
        toast({
          title: "Withdrawal initiated",
          description: `${formatCurrency(parseFloat(amount), currentCurrency)} will be sent to your bank account`
        });
        onOpenChange(false);
        setAmount(""); // Reset form
      }
    } catch (error) {
      console.error("Error during withdrawal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateWithdrawal = async () => {
    // Generate random amount between 5000 and 10000
    const randomAmount = Math.floor(Math.random() * 5000) + 5000;
    
    // Check if there's enough balance
    if (randomAmount > currentBalance) {
      toast({
        title: "Insufficient funds",
        description: `You need at least ${formatCurrency(randomAmount, currentCurrency)} for this simulation`,
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await onWithdraw(-randomAmount);
      if (success) {
        toast({
          title: "Withdrawal simulated",
          description: `${formatCurrency(randomAmount, currentCurrency)} has been withdrawn from your account`
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error during simulated withdrawal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] w-full p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold">Withdraw Funds</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Transfer funds from your account to your bank account.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
                <span className="text-sm text-muted-foreground">
                  Available: {formatCurrency(currentBalance, currentCurrency)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                  {currentCurrency === 'EUR' ? '€' : 
                   currentCurrency === 'GBP' ? '£' : '$'}
                </span>
                <Input
                  id="amount"
                  type="text"
                  className="pl-8 h-12 text-lg"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawal-destination" className="text-sm font-medium">Destination</Label>
              <div className="border rounded-md p-4 bg-secondary/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-medium">Bank Account</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Default</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Chase • ••••4321
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-amber-800 flex gap-3 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-500" />
              <div>
                Withdrawals typically take 1-3 business days to process.
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 mt-8 pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-2 sm:order-1">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSimulateWithdrawal}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Simulate Withdrawal
              </Button>
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">•</span>
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Withdraw Funds
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
