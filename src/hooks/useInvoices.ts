
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Invoice } from "@/types/invoice";
import { useAuth } from "@/contexts/AuthContext";

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setInvoices(data || []);
    } catch (err: any) {
      console.error("Error fetching invoices:", err);
      setError(err.message);
      toast({
        title: "Error fetching invoices",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSampleInvoices = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add invoices",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const sampleInvoices = [
        {
          user_id: user.id,
          invoice_number: 'INV-2024-001',
          client_name: 'Acme Corporation',
          amount: 2500.00,
          status: 'paid',
          issue_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: 'Bank Transfer',
          description: 'Website development services'
        },
        {
          user_id: user.id,
          invoice_number: 'INV-2024-002',
          client_name: 'TechStart Inc.',
          amount: 1800.50,
          status: 'sent',
          issue_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: 'Credit Card',
          description: 'Monthly consulting retainer'
        },
        {
          user_id: user.id,
          invoice_number: 'INV-2024-003',
          client_name: 'Global Solutions',
          amount: 3450.00,
          status: 'draft',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Software implementation phase 1'
        },
        {
          user_id: user.id,
          invoice_number: 'INV-2024-004',
          client_name: 'Innovate Partners',
          amount: 950.75,
          status: 'overdue',
          issue_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: 'PayPal',
          description: 'Marketing services'
        },
        {
          user_id: user.id,
          invoice_number: 'INV-2024-005',
          client_name: 'First National Bank',
          amount: 5000.00,
          status: 'paid',
          issue_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: 'Bank Transfer',
          description: 'Financial software upgrade'
        }
      ];

      const { error } = await supabase.from("invoices").insert(sampleInvoices);
      
      if (error) throw error;
      
      toast({
        title: "Sample invoices added",
        description: "5 sample invoices have been added to your account",
      });
      
      // Refresh the invoices list
      fetchInvoices();
    } catch (err: any) {
      console.error("Error adding sample invoices:", err);
      toast({
        title: "Error adding sample invoices",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    addSampleInvoices
  };
};
