
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Bill } from "@/types/bill";
import { UserBalance } from "@/hooks/useUserBalance";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, BellRing, Check, CreditCard, DollarSign, Info, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePayments } from "@/hooks/usePayments";

interface PayBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
  balance: UserBalance | null;
  onPayBill: (bill: Bill) => Promise<void>;
  onTopUpRequest: () => void;
}

export function PayBillDialog({ 
  open, 
  onOpenChange, 
  bill,
  balance,
  onPayBill,
  onTopUpRequest
}: PayBillDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInsufficientFundsAlert, setShowInsufficientFundsAlert] = useState(false);
  const { createPaymentFromBill } = usePayments();
  
  if (!bill || !balance) return null;

  // Check if user has enough balance to pay the bill
  const hasEnoughBalance = Number(balance.available_amount) >= Number(bill.amount);
  
  const handlePayBill = async () => {
    if (!hasEnoughBalance) {
      setShowInsufficientFundsAlert(true);
      return;
    }

    setIsProcessing(true);
    try {
      // First create the payment record
      await createPaymentFromBill(bill);
      // Then update the bill status
      await onPayBill(bill);
      // The dialog will be closed by the parent component after successful payment
    } catch (error) {
      console.error("Error paying bill:", error);
      setIsProcessing(false);
    }
  };

  // Format dates for display
  const dueDate = new Date(bill.due_date).toLocaleDateString();
  const issueDate = new Date(bill.issue_date).toLocaleDateString();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Review the bill details before confirming payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Bill Number</div>
              <div className="font-mono">{bill.bill_number}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Vendor</div>
              <div>{bill.vendor}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Category</div>
              <div>{bill.category || "N/A"}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Issue Date</div>
              <div>{issueDate}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Due Date</div>
              <div className="flex items-center">
                {dueDate}
                {new Date(bill.due_date) < new Date() && (
                  <Badge variant="destructive" className="ml-2">
                    <BellRing className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Status</div>
              <Badge variant="outline">{bill.status}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Amount Due</div>
              <div className="text-lg font-bold">
                {formatCurrency(bill.amount, bill.currency)}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-gray-500" />
                  Available Balance
                </div>
                <div className="font-medium">
                  {formatCurrency(balance.available_amount, balance.currency)}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="font-medium flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-gray-500" />
                  After Payment
                </div>
                <div className={`font-medium ${hasEnoughBalance ? '' : 'text-red-500'}`}>
                  {hasEnoughBalance 
                    ? formatCurrency(balance.available_amount - bill.amount, balance.currency)
                    : "Insufficient Funds"}
                </div>
              </div>

              {!hasEnoughBalance && (
                <div className="flex items-center text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  <Info className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span>You don't have enough funds to pay this bill. Please top up your balance.</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            {hasEnoughBalance ? (
              <Button 
                type="button" 
                onClick={handlePayBill}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin mr-2">•</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={onTopUpRequest}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Top Up Balance
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insufficient funds alert dialog */}
      <AlertDialog open={showInsufficientFundsAlert} onOpenChange={setShowInsufficientFundsAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Funds</AlertDialogTitle>
            <AlertDialogDescription>
              You don't have enough funds to pay this bill. Would you like to top up your balance?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowInsufficientFundsAlert(false);
              onTopUpRequest();
            }}>
              <CreditCard className="h-4 w-4 mr-2" />
              Add Funds
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
