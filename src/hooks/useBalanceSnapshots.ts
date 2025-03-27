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
      
      // Use greater than or equal to for the startDate in ISO format
      const { data, error } = await supabase
        .from("balance_snapshots")
        .select("*")
        .eq("user_id", user.id)
        .gte("snapshot_date", startDate.toISOString())
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
          .gte("snapshot_date", startDate.toISOString())
          .order("snapshot_date", { ascending: true });
          
        if (newError) throw newError;
        setSnapshots(newData || []);
      } else {
        // Process the snapshots based on time scale
        const processedSnapshots = processSnapshots(data || [], timeScale, startDate, now);
        setSnapshots(processedSnapshots);
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

  // Process snapshots for the selected time scale
  const processSnapshots = (snapshots: BalanceSnapshot[], timeScale: string, startDate: Date, endDate: Date) => {
    if (snapshots.length === 0) return [];

    // Sort snapshots by date
    const sortedSnapshots = [...snapshots].sort(
      (a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
    );
    
    // For day view, return hourly intervals
    if (timeScale === 'day') {
      // Group by hour
      const hourlySnapshots: BalanceSnapshot[] = [];
      const hourMap = new Map<number, BalanceSnapshot>();
      
      for (const snapshot of sortedSnapshots) {
        const date = new Date(snapshot.snapshot_date);
        const hour = date.getHours();
        
        // Keep the latest snapshot for each hour
        hourMap.set(hour, snapshot);
      }
      
      // Generate missing hours with values from the previous hour
      for (let i = 0; i < 24; i++) {
        const hourStart = new Date(startDate);
        hourStart.setHours(startDate.getHours() + i);
        
        if (hourStart <= endDate) {
          const hour = hourStart.getHours();
          if (hourMap.has(hour)) {
            hourlySnapshots.push(hourMap.get(hour)!);
          } else {
            // Find the latest previous snapshot
            let prevSnapshot: BalanceSnapshot | null = null;
            for (let j = hour - 1; j >= 0; j--) {
              if (hourMap.has(j)) {
                prevSnapshot = hourMap.get(j)!;
                break;
              }
            }
            
            if (!prevSnapshot && hour > 0) {
              // Look for later hours if no previous found
              for (let j = hour + 1; j < 24; j++) {
                if (hourMap.has(j)) {
                  prevSnapshot = hourMap.get(j)!;
                  break;
                }
              }
            }
            
            // If we found a previous snapshot, use its value
            if (prevSnapshot) {
              const hourSnapshotDate = new Date(hourStart);
              hourlySnapshots.push({
                ...prevSnapshot,
                id: `generated-${hour}`,
                snapshot_date: hourSnapshotDate.toISOString()
              });
            }
          }
        }
      }
      
      return hourlySnapshots;
    } 
    // For week view, return daily intervals
    else if (timeScale === 'week') {
      // Group by day
      const dailySnapshots: BalanceSnapshot[] = [];
      const dayMap = new Map<string, BalanceSnapshot>();
      
      for (const snapshot of sortedSnapshots) {
        const date = new Date(snapshot.snapshot_date);
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Keep the latest snapshot for each day
        dayMap.set(dayKey, snapshot);
      }
      
      // Generate all days in the range
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);
        
        if (dayDate <= endDate) {
          const dayKey = dayDate.toISOString().split('T')[0];
          
          if (dayMap.has(dayKey)) {
            dailySnapshots.push(dayMap.get(dayKey)!);
          } else {
            // Find the latest previous snapshot
            let prevSnapshot: BalanceSnapshot | null = null;
            let currentDate = new Date(dayDate);
            
            while (!prevSnapshot && currentDate >= startDate) {
              currentDate.setDate(currentDate.getDate() - 1);
              const prevKey = currentDate.toISOString().split('T')[0];
              if (dayMap.has(prevKey)) {
                prevSnapshot = dayMap.get(prevKey)!;
              }
            }
            
            // If no previous snapshot found, try to find a later one
            if (!prevSnapshot) {
              currentDate = new Date(dayDate);
              while (!prevSnapshot && currentDate <= endDate) {
                currentDate.setDate(currentDate.getDate() + 1);
                const nextKey = currentDate.toISOString().split('T')[0];
                if (dayMap.has(nextKey)) {
                  prevSnapshot = dayMap.get(nextKey)!;
                }
              }
            }
            
            // If we found a previous or later snapshot, use its value
            if (prevSnapshot) {
              dailySnapshots.push({
                ...prevSnapshot,
                id: `generated-${dayKey}`,
                snapshot_date: dayDate.toISOString()
              });
            }
          }
        }
      }
      
      return dailySnapshots;
    }
    // For month view, return data points spread across the 30 days
    else if (timeScale === 'month') {
      // Group by day for monthly view too
      const monthlySnapshots: BalanceSnapshot[] = [];
      const dayMap = new Map<string, BalanceSnapshot>();
      
      for (const snapshot of sortedSnapshots) {
        const date = new Date(snapshot.snapshot_date);
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Keep the latest snapshot for each day
        dayMap.set(dayKey, snapshot);
      }
      
      // For 30 days, we'll create points at regular intervals
      const totalDays = 30;
      const interval = Math.ceil(totalDays / 10); // Create ~10 data points
      
      for (let i = 0; i < totalDays; i += interval) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);
        
        if (dayDate <= endDate) {
          const dayKey = dayDate.toISOString().split('T')[0];
          
          if (dayMap.has(dayKey)) {
            monthlySnapshots.push(dayMap.get(dayKey)!);
          } else {
            // Find the latest previous snapshot
            let prevSnapshot: BalanceSnapshot | null = null;
            let currentDate = new Date(dayDate);
            
            // Look back up to interval days
            for (let j = 0; j < interval; j++) {
              currentDate.setDate(currentDate.getDate() - 1);
              const prevKey = currentDate.toISOString().split('T')[0];
              if (dayMap.has(prevKey)) {
                prevSnapshot = dayMap.get(prevKey)!;
                break;
              }
            }
            
            // If no previous snapshot found, try to find a later one
            if (!prevSnapshot) {
              currentDate = new Date(dayDate);
              for (let j = 0; j < interval; j++) {
                currentDate.setDate(currentDate.getDate() + 1);
                const nextKey = currentDate.toISOString().split('T')[0];
                if (dayMap.has(nextKey)) {
                  prevSnapshot = dayMap.get(nextKey)!;
                  break;
                }
              }
            }
            
            // If we found a previous or later snapshot, use its value
            if (prevSnapshot) {
              monthlySnapshots.push({
                ...prevSnapshot,
                id: `generated-${dayKey}`,
                snapshot_date: dayDate.toISOString()
              });
            }
          }
        }
      }
      
      return monthlySnapshots;
    }
    
    return sortedSnapshots;
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
          snapshot_date: currentDate.toISOString() // Store full ISO string for more precision
        });
        
        // Move to next interval
        if (timeScale === 'day') {
          currentDate.setHours(currentDate.getHours() + 1);
        } else {
          currentDate.setDate(currentDate.getDate() + interval);
        }
      }
      
      if (snapshots.length > 0) {
        // Insert batch of snapshots
        const { error } = await supabase
          .from("balance_snapshots")
          .insert(snapshots);

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
      const now = new Date();
      
      const { error } = await supabase
        .from("balance_snapshots")
        .insert({
          user_id: user.id,
          amount: currentBalance,
          currency: currency,
          snapshot_date: now.toISOString() // Store full timestamp
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
