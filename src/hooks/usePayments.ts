
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "./useTransactions";
import { useQueryClient } from "@tanstack/react-query";

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
  const { createTransaction, fetchTransactions } = useTransactions();
  const queryClient = useQueryClient();

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
      
      // Calculate total sent amount from completed payments only
      const completedPayments = typedPayments.filter(payment => payment.status === 'Completed');
      const totalPaymentsAmount = completedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      
      setTotalSent(totalPaymentsAmount);
      
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
      
      // Create a corresponding transaction record of type 'Payment'
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
        
        // Refresh transactions after creating a new one
        fetchTransactions();
      } catch (transactionError) {
        console.error("Error creating transaction record:", transactionError);
        // Continue even if transaction record creation fails
      }
      
      // Refresh payments
      fetchPayments();
      
      // Invalidate queries to trigger refetching
      queryClient.invalidateQueries({ queryKey: ["userBalance"] });
      queryClient.invalidateQueries({ queryKey: ["userActions"] });
      
      return data?.[0] || null;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  };

  const createInternalTransferPayment = async (transferData: {
    amount: number;
    currency: string;
    fromAccount: string;
    toAccount: string;
    reference?: string;
  }) => {
    if (!user) return null;
    
    try {
      // Create payment record for internal transfer
      const newPayment = {
        user_id: user.id,
        amount: transferData.amount,
        currency: transferData.currency,
        payment_date: new Date().toISOString(),
        payment_method: transferData.fromAccount,
        status: "Completed" as const,
        recipient: transferData.toAccount,
        payment_reference: transferData.reference || null,
        payment_type: "internal_transfer"
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
          amount: transferData.amount,
          currency: transferData.currency,
          status: 'Completed',
          recipient: transferData.toAccount,
          description: `Internal transfer to ${transferData.toAccount}`,
          reference_type: 'internal_transfer'
        });
        
        // Refresh transactions after creating a new one
        fetchTransactions();
      } catch (transactionError) {
        console.error("Error creating transaction record:", transactionError);
      }
      
      // Refresh payments
      fetchPayments();
      
      // Invalidate queries to trigger refetching
      queryClient.invalidateQueries({ queryKey: ["userBalance"] });
      queryClient.invalidateQueries({ queryKey: ["userActions"] });
      
      return data?.[0] || null;
    } catch (error) {
      console.error("Error creating internal transfer payment:", error);
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
    createPaymentFromBill,
    createInternalTransferPayment
  };
}
