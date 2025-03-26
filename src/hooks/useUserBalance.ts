
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
        // Create a new balance record if one doesn't exist
        const { data: newBalance, error: insertError } = await supabase
          .from("user_balances")
          .insert([{ user_id: user.id, available_amount: 0 }])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setBalance(newBalance as UserBalance);
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

  const updateBalance = async (amount: number) => {
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
