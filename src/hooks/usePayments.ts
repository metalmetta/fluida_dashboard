
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalSent, setTotalSent] = useState(0);
  const [dueByEndOfMonth, setDueByEndOfMonth] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

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

      // Calculate total sent amount
      const totalAmount = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      setTotalSent(totalAmount);
      
      // Fetch bills due by end of month
      const today = new Date();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const { data: billsData, error: billsError } = await supabase
        .from("bills")
        .select("amount")
        .in("status", ["Draft", "Ready for payment"])
        .lte("due_date", endOfMonth.toISOString().split('T')[0]);
        
      if (billsError) throw billsError;
      
      // Calculate total amount due by end of month
      const dueAmount = billsData?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0;
      setDueByEndOfMonth(dueAmount);
      
      setPayments(paymentsData || []);
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
    dueByEndOfMonth,
    fetchPayments,
    createPaymentFromBill
  };
}
