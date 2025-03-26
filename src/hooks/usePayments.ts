
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "./useTransactions";

export interface Payment {
  id: string;
  user_id: string;
  bill_id: string | null;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: string | null;
  status: 'Completed' | 'Processing' | 'Failed';
  recipient: string;
  recipient_email: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
  payment_type: string | null;
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalSent, setTotalSent] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const { createTransaction } = useTransactions();

  const fetchPayments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("payment_date", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Properly type the payments data by ensuring status is one of the expected values
      const typedPayments: Payment[] = paymentsData?.map(payment => ({
        ...payment,
        status: (payment.status as 'Completed' | 'Processing' | 'Failed') || 'Completed'
      })) || [];
      
      // Fetch completed internal transfers
      const { data: transfersData, error: transfersError } = await supabase
        .from("internal_transfers")
        .select("*")
        .eq("status", "Completed");
        
      if (transfersError) throw transfersError;
      
      // Fetch bills with status "Paid"
      const { data: paidBillsData, error: paidBillsError } = await supabase
        .from("bills")
        .select("*")
        .eq("status", "Paid");
        
      if (paidBillsError) throw paidBillsError;

      // Calculate total sent amount from payments, paid bills, and internal transfers
      const paymentsAmount = typedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      const transfersAmount = transfersData?.reduce((sum, transfer) => sum + Number(transfer.amount), 0) || 0;
      const paidBillsAmount = paidBillsData?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0;
      
      setTotalSent(paymentsAmount + transfersAmount + paidBillsAmount);
      
      // Fetch bills in "Draft" or "Ready for payment" status
      const { data: dueBillsData, error: dueBillsError } = await supabase
        .from("bills")
        .select("amount")
        .in("status", ["Draft", "Ready for payment"]);
        
      if (dueBillsError) throw dueBillsError;
      
      // Calculate total amount due regardless of date
      const dueAmount = dueBillsData?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0;
      setDueAmount(dueAmount);
      
      setPayments(typedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentFromBill = async (bill: any) => {
    if (!user) return null;
    
    try {
      // Create payment record based on bill
      const newPayment = {
        user_id: user.id,
        bill_id: bill.id,
        amount: bill.amount,
        currency: bill.currency,
        recipient: bill.vendor,
        status: "Completed" as const,
        payment_reference: bill.bill_number
      };

      const { data, error } = await supabase
        .from("payments")
        .insert([newPayment])
        .select();

      if (error) throw error;
      
      // Create a corresponding transaction record
      try {
        await createTransaction({
          type: 'Payment',
          amount: bill.amount,
          currency: bill.currency,
          status: 'Completed',
          recipient: bill.vendor,
          description: `Payment for bill ${bill.bill_number}`,
          reference_id: bill.id,
          reference_type: 'bill'
        });
      } catch (transactionError) {
        console.error("Error creating transaction record:", transactionError);
        // Continue even if transaction record creation fails
      }
      
      // Refresh payments
      fetchPayments();
      
      return data?.[0] || null;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  return { 
    payments, 
    isLoading, 
    totalSent,
    dueAmount,
    fetchPayments,
    createPaymentFromBill
  };
}
