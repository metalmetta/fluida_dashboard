
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface BalanceSnapshot {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  snapshot_date: string;
  created_at: string;
}

export function useBalanceSnapshots(timeScale: 'week' | 'month' | '3months' = 'week') {
  const [snapshots, setSnapshots] = useState<BalanceSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSnapshots = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Calculate the date range based on timeScale
      const now = new Date();
      const startDate = new Date(now);
      
      if (timeScale === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeScale === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (timeScale === '3months') {
        startDate.setMonth(startDate.getMonth() - 3);
      }
      
      const { data, error } = await supabase
        .from("balance_snapshots")
        .select("*")
        .eq("user_id", user.id)
        .gte("snapshot_date", startDate.toISOString().split('T')[0])
        .order("snapshot_date", { ascending: true });

      if (error) {
        throw error;
      }

      setSnapshots(data || []);
    } catch (error) {
      console.error("Error fetching balance snapshots:", error);
      toast({
        title: "Error",
        description: "Failed to load balance history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSnapshot = async (currentBalance: number, currency: string) => {
    if (!user) return false;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("balance_snapshots")
        .upsert({
          user_id: user.id,
          amount: currentBalance,
          currency: currency,
          snapshot_date: today
        }, { 
          onConflict: 'user_id,snapshot_date'
        });

      if (error) {
        throw error;
      }
      
      await fetchSnapshots();
      return true;
    } catch (error) {
      console.error("Error creating balance snapshot:", error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchSnapshots();
    } else {
      setSnapshots([]);
      setIsLoading(false);
    }
  }, [user, timeScale]);

  return { 
    snapshots, 
    isLoading, 
    fetchSnapshots, 
    createSnapshot 
  };
}
