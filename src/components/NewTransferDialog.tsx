
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePaymentMethods } from "@/components/settings/payment-methods/usePaymentMethods";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { ArrowDown, Wallet, AlertCircle } from "lucide-react";
import { usePayments } from "@/hooks/usePayments";
import { useUserBalance } from "@/hooks/useUserBalance";
import { TopUpBalanceDialog } from "@/components/TopUpBalanceDialog";

interface NewTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransferComplete?: () => void;
}

export function NewTransferDialog({
  open,
  onOpenChange,
  onTransferComplete
}: NewTransferDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();
  const { createInternalTransferPayment } = usePayments();
  const { balance, updateBalance, fetchBalance } = useUserBalance();
  
  const [toAccount, setToAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [reference, setReference] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setToAccount("");
      setAmount("");
      setCurrency("USD");
      setReference("");
      setDescription("");
      setInsufficientFunds(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to make a transfer",
        variant: "destructive",
      });
      return;
    }
    
    if (!toAccount) {
      toast({
        title: "Error",
        description: "Please select a destination account",
        variant: "destructive",
      });
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has sufficient balance
    if (balance && amountValue > balance.available_amount) {
      setInsufficientFunds(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get destination account details
      const destinationAccount = paymentMethods.find(method => method.id === toAccount);
      
      if (!destinationAccount) {
        throw new Error("Destination account information not found");
      }
      
      // Create internal transfer record
      const { data: transferData, error: transferError } = await supabase
        .from("internal_transfers")
        .insert({
          user_id: user.id,
          amount: amountValue,
          currency: currency,
          from_account: "Fluida Balance",
          to_account: destinationAccount.label,
          status: "Completed",
          reference: reference || null,
          description: description || null,
        })
        .select()
        .single();
        
      if (transferError) throw transferError;
      
      // Create payment record using the hook
      await createInternalTransferPayment({
        amount: amountValue,
        currency: currency,
        fromAccount: "Fluida Balance",
        toAccount: destinationAccount.label,
        reference: reference || null
      });
      
      // Update user balance
      await updateBalance(-amountValue, 'Withdraw', 
        `Transfer to ${destinationAccount.label}${reference ? ` (Ref: ${reference})` : ''}`
      );
      
      toast({
        title: "Success!",
        description: `Transfer of ${formatCurrency(amountValue, currency)} completed successfully`,
      });
      
      onOpenChange(false);
      if (onTransferComplete) onTransferComplete();
    } catch (error) {
      console.error("Error creating transfer:", error);
      toast({
        title: "Error",
        description: "Failed to complete transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTopUpComplete = async () => {
    setTopUpDialogOpen(false);
    await fetchBalance();
    setInsufficientFunds(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Transfer</DialogTitle>
            <DialogDescription>
              Transfer funds from your Fluida balance to your payment methods.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fromAccount">From Account</Label>
                <div className="flex items-center p-3 border rounded-md bg-muted/50">
                  <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Fluida Balance</span>
                  <span className="ml-auto font-medium">
                    {balance ? formatCurrency(balance.available_amount, balance.currency) : "Loading..."}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <ArrowDown className="my-2 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="toAccount">To Account</Label>
                <Select 
                  value={toAccount} 
                  onValueChange={setToAccount}
                  disabled={paymentMethodsLoading || isSubmitting}
                >
                  <SelectTrigger id="toAccount" className="w-full">
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={`to-${method.id}`} value={method.id}>
                        {method.label} ({method.type.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={currency}
                    disabled={true}
                    className="bg-muted"
                  />
                </div>
              </div>
              
              {insufficientFunds && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Insufficient funds in your Fluida Balance. 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-semibold ml-1" 
                      onClick={() => setTopUpDialogOpen(true)}
                    >
                      Top up your balance
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="reference">Reference (Optional)</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Reference number or ID"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Transfer description"
                  disabled={isSubmitting}
                />
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
                disabled={paymentMethodsLoading || isSubmitting || !toAccount || !amount || insufficientFunds}
              >
                {isSubmitting ? "Processing..." : "Complete Transfer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <TopUpBalanceDialog 
        open={topUpDialogOpen} 
        onOpenChange={setTopUpDialogOpen}
        onSuccess={handleTopUpComplete}
      />
    </>
  );
}
