
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import { generateInvoiceId } from "@/lib/billUtils";
import { useAuth } from "@/contexts/AuthContext";

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const typedData = data.map(invoice => ({
        ...invoice,
        status: invoice.status as Invoice['status']
      }));

      setInvoices(typedData);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSampleInvoices = async () => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add sample invoices",
          variant: "destructive"
        });
        return;
      }

      const currentDate = new Date();
      
      const sampleInvoices = [
        {
          user_id: user.id,
          invoice_number: generateInvoiceId(currentDate, "Acme Corporation", "001"),
          client_name: "Acme Corporation",
          amount: 2500.00,
          status: "paid" as Invoice['status'],
          issue_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: "Bank Transfer",
          description: "Website development services"
        },
        {
          user_id: user.id,
          invoice_number: generateInvoiceId(currentDate, "TechStart Inc.", "002"),
          client_name: "TechStart Inc.",
          amount: 1800.50,
          status: "sent" as Invoice['status'],
          issue_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: "Credit Card",
          description: "Monthly consulting retainer"
        },
        {
          user_id: user.id,
          invoice_number: generateInvoiceId(currentDate, "Global Solutions", "003"),
          client_name: "Global Solutions",
          amount: 3450.00,
          status: "draft" as Invoice['status'],
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: "Software implementation phase 1"
        },
        {
          user_id: user.id,
          invoice_number: generateInvoiceId(currentDate, "Innovate Partners", "004"),
          client_name: "Innovate Partners",
          amount: 950.75,
          status: "overdue" as Invoice['status'],
          issue_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: "PayPal",
          description: "Marketing services"
        },
        {
          user_id: user.id,
          invoice_number: generateInvoiceId(currentDate, "First National Bank", "005"),
          client_name: "First National Bank",
          amount: 5000.00,
          status: "paid" as Invoice['status'],
          issue_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: "Bank Transfer",
          description: "Financial software upgrade"
        }
      ];

      const { error } = await supabase.from("invoices").insert(sampleInvoices);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Sample invoices added successfully"
      });

      fetchInvoices();
    } catch (error) {
      console.error("Error adding sample invoices:", error);
      toast({
        title: "Error",
        description: "Failed to add sample invoices",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Updated formatPaymentMethod to only allow the three specified payment methods
  const formatPaymentMethod = (paymentMethod: string | undefined): string => {
    if (!paymentMethod) return "—";
    
    // Standardize the input by removing spaces and making it lowercase
    const normalizedMethod = paymentMethod.toLowerCase().replace(/\s+/g, '_');
    
    // Map to one of the three allowed payment methods
    if (normalizedMethod.includes('bank') || normalizedMethod === 'bank_transfer') {
      return "Bank Transfer";
    }
    
    if (normalizedMethod.includes('blockchain') || normalizedMethod === 'blockchain_transfer') {
      return "Blockchain Transfer";
    }
    
    if (normalizedMethod.includes('credit') || normalizedMethod === 'credit_card') {
      return "Credit Card";
    }
    
    // Default fallback for any other values
    return "Bank Transfer";
  };

  return { 
    invoices, 
    isLoading, 
    fetchInvoices, 
    addSampleInvoices,
    formatPaymentMethod 
  };
}
