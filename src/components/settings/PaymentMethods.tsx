
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaymentMethods } from "./payment-methods/usePaymentMethods";
import { PaymentMethodCard } from "./payment-methods/PaymentMethodCard";
import { EmptyState } from "./payment-methods/EmptyState";
import { AddPaymentMethodDialog } from "./payment-methods/AddPaymentMethodDialog";

export default function PaymentMethods() {
  const {
    paymentMethods,
    loading,
    dialogOpen,
    setDialogOpen,
    newPaymentMethod,
    handleInputChange,
    handleDetailChange,
    handleSubmit,
    deletePaymentMethod,
    setDefaultPaymentMethod
  } = usePaymentMethods();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Payment Methods</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <p>Loading payment methods...</p>
        </div>
      ) : paymentMethods.length === 0 ? (
        <EmptyState onAddNew={() => setDialogOpen(true)} />
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onSetDefault={setDefaultPaymentMethod}
              onDelete={deletePaymentMethod}
            />
          ))}
        </div>
      )}

      <AddPaymentMethodDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        newPaymentMethod={newPaymentMethod}
        onInputChange={handleInputChange}
        onDetailChange={handleDetailChange}
      />
    </div>
  );
}
