
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, DollarSign, Euro, PoundSterling, Wallet } from "lucide-react";
import { PaymentMethod } from "@/types/invoice";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PaymentMethodCard({ method, onSetDefault, onDelete }: PaymentMethodCardProps) {
  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'usd':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'eur':
        return <Euro className="h-5 w-5 text-blue-600" />;
      case 'gbp':
        return <PoundSterling className="h-5 w-5 text-purple-600" />;
      case 'usdc':
        return <Wallet className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {getPaymentMethodIcon(method.type)}
          <div>
            <div className="flex items-center">
              <h3 className="font-medium">{method.label}</h3>
              {method.isDefault && (
                <span className="ml-2 text-xs bg-primary/10 text-primary py-0.5 px-2 rounded-full">
                  Default
                </span>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground mt-1">
              {method.type === 'usd' && (
                <span>USD • Account ending in {method.details.accountNumber.slice(-4)}</span>
              )}
              {method.type === 'eur' && (
                <span>EUR • IBAN ending in {method.details.iban.slice(-4)}</span>
              )}
              {method.type === 'gbp' && (
                <span>GBP • Account ending in {method.details.accountNumber.slice(-4)}</span>
              )}
              {method.type === 'usdc' && (
                <span>USDC • Solana</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!method.isDefault && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSetDefault(method.id)}
            >
              Make Default
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(method.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
