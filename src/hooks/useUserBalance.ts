
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "./useTransactions";

export interface UserBalance {
  id: string;
  user_id: string;
  available_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export function useUserBalance() {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { createTransaction } = useTransactions();

  const fetchBalance = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Check if user has a balance record
      const { data, error } = await supabase
        .from("user_balances")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setBalance(data as UserBalance);
      } else {
        // Create a new balance record if one doesn't exist using upsert to prevent conflicts
        const { data: newBalance, error: insertError } = await supabase
          .from("user_balances")
          .upsert([{ 
            user_id: user.id, 
            available_amount: 0,
            currency: "USD"
          }], { 
            onConflict: 'user_id' 
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setBalance(newBalance as UserBalance);
      }
      
      // Create snapshot for initial balance
      try {
        if (data) {
          await createBalanceSnapshot(data.available_amount, data.currency);
        }
      } catch (snapshotError) {
        console.error("Error creating balance snapshot:", snapshotError);
      }
    } catch (error) {
      console.error("Error fetching user balance:", error);
      toast({
        title: "Error",
        description: "Failed to load balance information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a balance snapshot with full timestamp precision
  const createBalanceSnapshot = async (amount: number, currency: string) => {
    if (!user) return false;
    
    try {
      const now = new Date();
      
      // Store with full timestamp precision
      const { error } = await supabase
        .from("balance_snapshots")
        .insert({
          user_id: user.id,
          amount: amount,
          currency: currency,
          snapshot_date: now.toISOString() // Store full timestamp for better precision
        });

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error creating balance snapshot:", error);
      return false;
    }
  };

  const updateBalance = async (amount: number, transactionType: 'Deposit' | 'Withdraw' = 'Deposit', description?: string) => {
    if (!user || !balance) return;

    try {
      const newAmount = Number(balance.available_amount) + Number(amount);
      
      const { data, error } = await supabase
        .from("user_balances")
        .update({ 
          available_amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Only create transaction records for appropriate transactions
      if (description?.toLowerCase().indexOf('bill') === -1) {
        try {
          await createTransaction({
            type: transactionType,
            amount: Math.abs(amount),
            currency: balance.currency,
            status: 'Completed',
            description: description || `${transactionType} transaction`
          });
        } catch (transactionError) {
          console.error("Error creating transaction record:", transactionError);
        }
      }
      
      // Always create a balance snapshot after balance changes
      await createBalanceSnapshot(newAmount, balance.currency);

      setBalance(data as UserBalance);
      
      return true;
    } catch (error) {
      console.error("Error updating balance:", error);
      toast({
        title: "Error",
        description: "Failed to update balance",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
    } else {
      setBalance(null);
      setIsLoading(false);
    }
  }, [user]);

  return { 
    balance, 
    isLoading, 
    fetchBalance, 
    updateBalance
  };
}
