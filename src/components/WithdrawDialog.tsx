
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
import { AlertTriangle, DollarSign, X } from "lucide-react";
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
      <DialogContent className="sm:max-w-[500px] w-full p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold">Withdraw Funds</DialogTitle>
          <DialogDescription className="text-blue-600 mt-1 text-base">
            Transfer funds from your account to your bank account.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="px-6">
          <div className="space-y-5 pt-2 pb-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="amount" className="text-lg font-medium">Amount</Label>
                <span className="text-blue-600 font-medium">
                  Available: {formatCurrency(currentBalance, currentCurrency)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
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

            <div className="space-y-3">
              <Label htmlFor="withdrawal-destination" className="text-lg font-medium">Destination</Label>
              <div className="border rounded-md p-4 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Bank Account</span>
                  <span className="text-blue-600 font-medium">Default</span>
                </div>
                <div className="text-blue-600 font-medium mt-1">
                  Chase • ••••4321
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-amber-800 flex gap-3 text-base">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                Withdrawals typically take 1-3 business days to process.
              </div>
            </div>
          </div>

          <DialogFooter className="flex pb-6 pt-2 px-0 gap-3">
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="text-base h-12"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSimulateWithdrawal}
                disabled={isSubmitting}
                className="text-base h-12"
              >
                Simulate Withdrawal
              </Button>
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-base h-12"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">•</span>
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-5 w-5 mr-2" />
                  Withdraw Funds
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Custom close button position to match the design */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-5 top-5 rounded-full p-1 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
