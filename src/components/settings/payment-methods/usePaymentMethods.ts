
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod } from "@/types/invoice";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function usePaymentMethods() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState<{
    type: string;
    label: string;
    details: {[key: string]: string};
    isDefault: boolean;
  }>({
    type: "usd",
    label: "",
    details: {},
    isDefault: false
  });

  const loadPaymentMethods = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Use type assertion to handle the custom table
      const { data, error } = await supabase
        .from('payment_methods' as any)
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        // Map the data to match our PaymentMethod interface
        const methods = data.map((item: any) => ({
          id: item.id,
          type: item.type,
          label: item.label,
          details: item.details,
          isDefault: item.is_default
        }));
        setPaymentMethods(methods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: "Error",
        description: "Could not load payment methods",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setNewPaymentMethod((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDetailChange = (field: string, value: string) => {
    setNewPaymentMethod((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      // Validation
      if (!newPaymentMethod.label.trim()) {
        toast({
          title: "Error",
          description: "Payment method name is required",
          variant: "destructive"
        });
        return;
      }

      // Type-specific validation
      switch (newPaymentMethod.type) {
        case "usd":
          if (!newPaymentMethod.details.routingNumber || !newPaymentMethod.details.accountNumber) {
            toast({
              title: "Error",
              description: "Routing number and account number are required for USD payments",
              variant: "destructive"
            });
            return;
          }
          break;
        case "eur":
          if (!newPaymentMethod.details.iban) {
            toast({
              title: "Error",
              description: "IBAN is required for EUR payments",
              variant: "destructive"
            });
            return;
          }
          break;
        case "gbp":
          if (!newPaymentMethod.details.sortCode || !newPaymentMethod.details.accountNumber) {
            toast({
              title: "Error",
              description: "Sort code and account number are required for GBP payments",
              variant: "destructive"
            });
            return;
          }
          break;
        case "usdc":
          if (!newPaymentMethod.details.solanaAddress) {
            toast({
              title: "Error",
              description: "Solana address is required for USDC payments",
              variant: "destructive"
            });
            return;
          }
          break;
      }

      // If this is the first payment method or explicitly set as default, make it default
      const isDefault = newPaymentMethod.isDefault || paymentMethods.length === 0;

      // If we're setting this as default, update any existing default
      if (isDefault) {
        await supabase
          .from('payment_methods' as any)
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      // Insert the new payment method
      const { error } = await supabase
        .from('payment_methods' as any)
        .insert({
          user_id: user.id,
          type: newPaymentMethod.type,
          label: newPaymentMethod.label,
          details: newPaymentMethod.details,
          is_default: isDefault
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Payment method added successfully"
      });
      
      // Reset form and reload data
      setNewPaymentMethod({
        type: "usd",
        label: "",
        details: {},
        isDefault: false
      });
      setDialogOpen(false);
      loadPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Could not add payment method",
        variant: "destructive"
      });
    }
  };

  const deletePaymentMethod = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('payment_methods' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success", 
        description: "Payment method deleted successfully"
      });
      
      loadPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "Could not delete payment method",
        variant: "destructive"
      });
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    if (!user) return;
    
    try {
      // First, clear any existing default
      await supabase
        .from('payment_methods' as any)
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);
      
      // Set the new default
      const { error } = await supabase
        .from('payment_methods' as any)
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Default payment method updated"
      });
      
      loadPaymentMethods();
    } catch (error) {
      console.error('Error updating default payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive"
      });
    }
  };

  return {
    paymentMethods,
    loading,
    dialogOpen,
    setDialogOpen,
    newPaymentMethod,
    handleInputChange,
    handleDetailChange,
    handleSubmit,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    loadPaymentMethods
  };
}
