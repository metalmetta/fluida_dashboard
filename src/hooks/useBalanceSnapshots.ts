
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

export function useBalanceSnapshots(timeScale: 'day' | 'week' | 'month' = 'week') {
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
      
      if (timeScale === 'day') {
        // Last 24 hours
        startDate.setHours(startDate.getHours() - 24);
      } else if (timeScale === 'week') {
        // Last 7 days
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeScale === 'month') {
        // Last 30 days
        startDate.setDate(startDate.getDate() - 30);
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

      if (data && data.length === 0) {
        // No snapshots found, create default ones for the time period
        await createDefaultSnapshots(startDate, now);
        
        // Fetch again after creating default snapshots
        const { data: newData, error: newError } = await supabase
          .from("balance_snapshots")
          .select("*")
          .eq("user_id", user.id)
          .gte("snapshot_date", startDate.toISOString().split('T')[0])
          .order("snapshot_date", { ascending: true });
          
        if (newError) throw newError;
        setSnapshots(newData || []);
      } else {
        setSnapshots(data || []);
      }
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

  const createDefaultSnapshots = async (startDate: Date, endDate: Date) => {
    if (!user) return false;
    
    try {
      const snapshots = [];
      const currentDate = new Date(startDate);
      
      // Determine interval based on time scale
      let interval = 1; // days
      if (timeScale === 'day') {
        // For day view, create hourly snapshots
        interval = 1/24; // 1 hour as fraction of day
      }
      
      // Generate a snapshot for each interval from start date to end date
      while (currentDate <= endDate) {
        snapshots.push({
          user_id: user.id,
          amount: 0, // Default to 0 for past days
          currency: "USD",
          snapshot_date: currentDate.toISOString().split('T')[0]
        });
        
        // Move to next interval
        if (timeScale === 'day') {
          currentDate.setHours(currentDate.getHours() + 1);
        } else {
          currentDate.setDate(currentDate.getDate() + interval);
        }
      }
      
      if (snapshots.length > 0) {
        const { error } = await supabase
          .from("balance_snapshots")
          .upsert(snapshots, { 
            onConflict: 'user_id,snapshot_date'
          });

        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error creating default balance snapshots:", error);
      return false;
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
