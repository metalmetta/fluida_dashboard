
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface UserAction {
  id: string;
  user_id: string;
  action_type: string;
  amount: number | null;
  currency: string;
  status: string;
  description: string | null;
  requires_approval: boolean;
  approvals: number;
  required_approvals: number;
  created_at: string;
  updated_at: string;
}

export function useUserActions() {
  const [actions, setActions] = useState<UserAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchActions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Cast to any to bypass TypeScript's type checking
      const { data, error } = await (supabase
        .from("user_actions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }) as any);

      if (error) {
        throw error;
      }

      setActions(data || []);
    } catch (error) {
      console.error("Error fetching user actions:", error);
      toast({
        title: "Error",
        description: "Failed to load actions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAction = async (actionData: Omit<UserAction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      // Cast to any to bypass TypeScript's type checking
      const { data, error } = await (supabase
        .from("user_actions")
        .insert([{ 
          user_id: user.id,
          ...actionData
        }])
        .select() as any);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setActions(prevActions => [data[0], ...prevActions]);
        return data[0];
      }
      return null;
    } catch (error) {
      console.error("Error adding user action:", error);
      toast({
        title: "Error",
        description: "Failed to create action",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateActionStatus = async (actionId: string, status: string) => {
    if (!user) return;

    try {
      // Cast to any to bypass TypeScript's type checking
      const { data, error } = await (supabase
        .from("user_actions")
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", actionId)
        .eq("user_id", user.id)
        .select() as any);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setActions(prevActions => 
          prevActions.map(action => 
            action.id === actionId ? data[0] : action
          )
        );
        return data[0];
      }
      return null;
    } catch (error) {
      console.error("Error updating action status:", error);
      toast({
        title: "Error",
        description: "Failed to update action status",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchActions();
    } else {
      setActions([]);
      setIsLoading(false);
    }
  }, [user]);

  return { 
    actions, 
    isLoading, 
    fetchActions, 
    addAction,
    updateActionStatus
  };
}
