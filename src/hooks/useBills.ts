
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bill } from "@/types/bill";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchBills = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Ensure the type is properly cast as our Bill type
      const typedBills = data?.map(bill => ({
        ...bill,
        status: bill.status as Bill['status'], // Explicitly cast to the union type
        currency: bill.currency || 'USD' // Default to USD if missing
      })) || [];
      
      setBills(typedBills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast({
        title: "Error",
        description: "Failed to load bills. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addBill = async (billData: Omit<Bill, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a bill",
        variant: "destructive"
      });
      return;
    }

    try {
      const newBill = {
        ...billData,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from("bills")
        .insert([newBill])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Bill added successfully"
      });

      // Refresh the bills list
      fetchBills();
      
      return data?.[0];
    } catch (error) {
      console.error("Error adding bill:", error);
      toast({
        title: "Error",
        description: "Failed to add bill",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateBillStatus = async (billId: string, newStatus: Bill['status']) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update a bill",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("bills")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", billId)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Update the bill in the local state
      setBills(prevBills => 
        prevBills.map(bill => 
          bill.id === billId ? { ...bill, status: newStatus } : bill
        )
      );

      return true;
    } catch (error) {
      console.error("Error updating bill status:", error);
      throw error;
    }
  };

  const addSampleBills = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add sample bills",
        variant: "destructive"
      });
      return;
    }

    try {
      const sampleBills = [
        {
          user_id: user.id,
          vendor: "Office Supplies Co",
          amount: 850.00,
          due_date: new Date('2024-02-01').toISOString().split('T')[0],
          status: "Draft" as const,
          category: "Supplies",
          bill_number: "BILL-001",
          description: "Monthly office supplies",
          currency: "USD"
        },
        {
          user_id: user.id,
          vendor: "Internet Services",
          amount: 199.99,
          due_date: new Date('2024-01-28').toISOString().split('T')[0],
          status: "Ready for payment" as const,
          category: "Utilities",
          bill_number: "BILL-002",
          description: "Monthly internet subscription",
          currency: "EUR"
        },
        {
          user_id: user.id,
          vendor: "Marketing Agency",
          amount: 3500.00,
          due_date: new Date('2024-02-15').toISOString().split('T')[0],
          status: "Paid" as const,
          category: "Marketing",
          bill_number: "BILL-003",
          description: "Q1 marketing campaign",
          currency: "GBP"
        }
      ];

      const { error } = await supabase.from("bills").insert(sampleBills);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Sample bills added successfully"
      });

      // Fetch the updated bills
      fetchBills();
    } catch (error) {
      console.error("Error adding sample bills:", error);
      toast({
        title: "Error",
        description: "Failed to add sample bills",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchBills();
    }
  }, [user]);

  return { 
    bills, 
    isLoading, 
    fetchBills, 
    addBill,
    addSampleBills,
    updateBillStatus
  };
}
