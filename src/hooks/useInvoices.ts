import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import { generateInvoiceNumber, isStandardizedFormat, getNextSequence } from "@/lib/documentUtils";
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

  const generateStandardInvoiceNumber = async (customerName: string, issueDate: Date): Promise<string> => {
    const yearMonth = `${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, '0')}`;
    const customerCode = customerName
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, Math.min(4, customerName.length));
    
    const sequence = getNextSequence(
      invoices, 
      'FL', 
      yearMonth, 
      customerCode
    );
    
    return generateInvoiceNumber({
      issueDate,
      customerName,
      sequence
    });
  };

  const addInvoice = async (invoiceData: any) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add an invoice",
        variant: "destructive"
      });
      return;
    }

    try {
      let invoiceNumber = invoiceData.invoice_number;
      if (!isStandardizedFormat(invoiceNumber)) {
        const issueDate = new Date(invoiceData.issue_date);
        invoiceNumber = await generateStandardInvoiceNumber(invoiceData.client_name, issueDate);
      }

      const newInvoice = {
        ...invoiceData,
        invoice_number: invoiceNumber,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from("invoices")
        .insert([newInvoice])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Invoice added successfully"
      });

      fetchInvoices();
      
      return data?.[0];
    } catch (error) {
      console.error("Error adding invoice:", error);
      toast({
        title: "Error",
        description: "Failed to add invoice",
        variant: "destructive"
      });
      return null;
    }
  };

  const addSampleInvoices = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast({
          title: "Error",
          description: "You must be logged in to add sample invoices",
          variant: "destructive"
        });
        return;
      }

      const sampleInvoices = [
        {
          user_id: userData.user.id,
          invoice_number: "INV-2024-001",
          client_name: "Acme Corporation",
          amount: 2500.00,
          status: "paid" as Invoice['status'],
          issue_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: "Bank Transfer",
          description: "Website development services"
        },
        {
          user_id: userData.user.id,
          invoice_number: "INV-2024-002",
          client_name: "TechStart Inc.",
          amount: 1800.50,
          status: "sent" as Invoice['status'],
          issue_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: "Credit Card",
          description: "Monthly consulting retainer"
        },
        {
          user_id: userData.user.id,
          invoice_number: "INV-2024-003",
          client_name: "Global Solutions",
          amount: 3450.00,
          status: "draft" as Invoice['status'],
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: "Software implementation phase 1"
        },
        {
          user_id: userData.user.id,
          invoice_number: "INV-2024-004",
          client_name: "Innovate Partners",
          amount: 950.75,
          status: "overdue" as Invoice['status'],
          issue_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_method: "PayPal",
          description: "Marketing services"
        },
        {
          user_id: userData.user.id,
          invoice_number: "INV-2024-005",
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

  const formatPaymentMethod = (paymentMethod: string | undefined): string => {
    if (!paymentMethod) return "—";
    
    if (paymentMethod === "bank_transfer") return "Bank Transfer";
    if (paymentMethod === "blockchain_transfer") return "Blockchain Transfer";
    if (paymentMethod === "credit_card") return "Credit Card";
    
    if (paymentMethod === "Bank Transfer") return "Bank Transfer";
    if (paymentMethod === "Credit Card") return "Credit Card";
    if (paymentMethod === "PayPal") return "PayPal";
    
    return paymentMethod
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return { 
    invoices, 
    isLoading, 
    fetchInvoices, 
    addSampleInvoices,
    formatPaymentMethod,
    addInvoice,
    generateStandardInvoiceNumber
  };
}
