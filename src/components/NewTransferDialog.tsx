
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePaymentMethods } from "@/components/settings/payment-methods/usePaymentMethods";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { usePayments } from "@/hooks/usePayments";

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
  const { createPaymentFromBill } = usePayments();
  
  const [fromAccount, setFromAccount] = useState<string>("");
  const [toAccount, setToAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [reference, setReference] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFromAccount("");
      setToAccount("");
      setAmount("");
      setCurrency("USD");
      setReference("");
      setDescription("");
    }
  }, [open]);

  // Update currency based on selected from account
  useEffect(() => {
    if (fromAccount) {
      const selectedMethod = paymentMethods.find(method => method.id === fromAccount);
      if (selectedMethod) {
        setCurrency(selectedMethod.type.toUpperCase());
      }
    }
  }, [fromAccount, paymentMethods]);

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
    
    if (!fromAccount || !toAccount) {
      toast({
        title: "Error",
        description: "Please select both source and destination accounts",
        variant: "destructive",
      });
      return;
    }
    
    if (fromAccount === toAccount) {
      toast({
        title: "Error",
        description: "Source and destination accounts cannot be the same",
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
    
    setIsSubmitting(true);
    
    try {
      // Get payment method details for from and to accounts
      const sourceAccount = paymentMethods.find(method => method.id === fromAccount);
      const destinationAccount = paymentMethods.find(method => method.id === toAccount);
      
      if (!sourceAccount || !destinationAccount) {
        throw new Error("Account information not found");
      }
      
      // Create internal transfer record
      const { data: transferData, error: transferError } = await supabase
        .from("internal_transfers")
        .insert({
          user_id: user.id,
          amount: amountValue,
          currency: currency,
          from_account: sourceAccount.label,
          to_account: destinationAccount.label,
          status: "Completed",
          reference: reference || null,
          description: description || null,
        })
        .select()
        .single();
        
      if (transferError) throw transferError;
      
      // Create payment record for the transfer
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount: amountValue,
          currency: currency,
          payment_date: new Date().toISOString(),
          status: "Completed",
          recipient: destinationAccount.label,
          recipient_email: destinationAccount.details.email || null,
          payment_reference: reference || null,
          payment_type: "internal_transfer",
          payment_method: sourceAccount.type,
        })
        .select()
        .single();
        
      if (paymentError) throw paymentError;
      
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Internal Transfer</DialogTitle>
          <DialogDescription>
            Transfer funds between your payment methods.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fromAccount">From Account</Label>
              <Select 
                value={fromAccount} 
                onValueChange={setFromAccount}
                disabled={paymentMethodsLoading || isSubmitting}
              >
                <SelectTrigger id="fromAccount" className="w-full">
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={`from-${method.id}`} value={method.id}>
                      {method.label} ({method.type.toUpperCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="my-2 text-muted-foreground" />
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
              disabled={paymentMethodsLoading || isSubmitting || !fromAccount || !toAccount || !amount}
            >
              {isSubmitting ? "Processing..." : "Complete Transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
