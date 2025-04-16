
import { useState, useEffect } from "react";
import { usePaymentMethods } from "@/components/settings/payment-methods/usePaymentMethods";
import { PaymentMethod } from "@/types/invoice";

export function useWithdrawPaymentMethods() {
  const { paymentMethods, loading } = usePaymentMethods();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [bankPaymentMethods, setBankPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    if (paymentMethods.length > 0) {
      // Filter to only include bank accounts (USD, EUR, GBP types)
      const bankMethods = paymentMethods.filter(method => 
        ['usd', 'eur', 'gbp'].includes(method.type.toLowerCase())
      );
      
      setBankPaymentMethods(bankMethods);
      
      // Set default payment method if available
      const defaultMethod = bankMethods.find(method => method.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod);
      } else if (bankMethods.length > 0) {
        setSelectedPaymentMethod(bankMethods[0]);
      }
    }
  }, [paymentMethods]);

  return {
    bankPaymentMethods,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    loading
  };
}
