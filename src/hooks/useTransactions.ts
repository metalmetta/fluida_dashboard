
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Transaction {
  id: string;
  user_id: string;
  type: 'Deposit' | 'Withdraw' | 'Payment';
  amount: number;
  currency: string;
  status: string;
  reference_id?: string;
  reference_type?: string;
  recipient?: string;
  description?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) throw error;

      // Type assertion to ensure correct typing of data from Supabase
      const typedTransactions: Transaction[] = data?.map(transaction => ({
        ...transaction,
        type: transaction.type as 'Deposit' | 'Withdraw' | 'Payment'
      })) || [];

      setTransactions(typedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transaction data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'transaction_date'>) => {
    if (!user) return null;
    
    try {
      const newTransaction = {
        ...transactionData,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("transactions")
        .insert([newTransaction])
        .select();

      if (error) throw error;
      
      // No need to refresh transactions here since we have realtime subscription
      
      return data?.[0] || null;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      
      // Set up real-time listener for transaction changes
      const channel = supabase
        .channel('transactions_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Transaction changes detected:', payload);
            // Refresh the transactions list when changes are detected
            fetchTransactions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return { 
    transactions, 
    isLoading, 
    fetchTransactions,
    createTransaction
  };
}
