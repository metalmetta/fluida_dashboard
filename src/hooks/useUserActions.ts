
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type UserAction = {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  currency: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
};

export const useUserActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: actions = [], isLoading, error } = useQuery({
    queryKey: ["userActions"],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_actions" as any)
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching user actions:", error);
        toast({
          title: "Error",
          description: "Failed to load pending actions",
          variant: "destructive",
        });
        return [];
      }
      
      return data as UserAction[];
    },
    enabled: !!user,
  });
  
  const createAction = useMutation({
    mutationFn: async (newAction: Omit<UserAction, "id" | "created_at" | "updated_at" | "user_id">) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("user_actions" as any)
        .insert([{ ...newAction, user_id: user.id }])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating action:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userActions"] });
      toast({
        title: "Success",
        description: "Action created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create action",
        variant: "destructive",
      });
    },
  });
  
  const updateAction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserAction> & { id: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("user_actions" as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating action:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userActions"] });
      toast({
        title: "Success",
        description: "Action updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update action",
        variant: "destructive",
      });
    },
  });
  
  const deleteAction = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("user_actions" as any)
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Error deleting action:", error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userActions"] });
      toast({
        title: "Success",
        description: "Action deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete action",
        variant: "destructive",
      });
    },
  });
  
  return {
    actions,
    isLoading,
    error,
    createAction,
    updateAction,
    deleteAction,
  };
};
