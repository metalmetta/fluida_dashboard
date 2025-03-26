
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
import { CreditCard, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface TopUpBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTopUp: (amount: number) => Promise<boolean>;
  currentCurrency: string;
}

export function TopUpBalanceDialog({ 
  open, 
  onOpenChange,
  onTopUp,
  currentCurrency
}: TopUpBalanceDialogProps) {
  const [amount, setAmount] = useState("100");
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

    setIsSubmitting(true);
    try {
      const success = await onTopUp(parseFloat(amount));
      if (success) {
        toast({
          title: "Success",
          description: `Added ${formatCurrency(parseFloat(amount), currentCurrency)} to your balance`
        });
        onOpenChange(false);
        setAmount("100"); // Reset form
      }
    } catch (error) {
      console.error("Error during top-up:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Top Up Balance</DialogTitle>
          <DialogDescription>
            Add funds to your account to pay bills and invoices.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {currentCurrency === 'EUR' ? '€' : 
                   currentCurrency === 'GBP' ? '£' : '$'}
                </span>
                <Input
                  id="amount"
                  type="text"
                  className="pl-8"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <div className="border rounded-md p-3 bg-gray-50 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">••••  ••••  ••••  4242</span>
                <span className="ml-auto text-xs text-gray-500">Default</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">•</span>
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Add Funds
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
