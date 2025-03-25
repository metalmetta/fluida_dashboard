
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  newPaymentMethod: {
    type: string;
    label: string;
    details: {[key: string]: string};
    isDefault: boolean;
  };
  onInputChange: (field: string, value: string) => void;
  onDetailChange: (field: string, value: string) => void;
}

export function AddPaymentMethodDialog({
  open,
  onOpenChange,
  onSubmit,
  newPaymentMethod,
  onInputChange,
  onDetailChange
}: AddPaymentMethodDialogProps) {
  const [activeTab, setActiveTab] = useState("fiat");

  // Update the payment method type when changing tabs
  useEffect(() => {
    if (activeTab === "fiat") {
      onInputChange('type', 'usd');
    } else if (activeTab === "crypto") {
      onInputChange('type', 'usdc');
    }
  }, [activeTab, onInputChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new payment method to use in your invoices
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="fiat">Bank Accounts</TabsTrigger>
            <TabsTrigger value="crypto">Crypto Wallets</TabsTrigger>
          </TabsList>

          <TabsContent value="fiat" className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-type">Currency</Label>
              <Select 
                value={newPaymentMethod.type} 
                onValueChange={(value) => onInputChange('type', value)}
              >
                <SelectTrigger id="payment-type">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="gbp">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Account Name</Label>
              <Input 
                id="label" 
                placeholder="e.g. Primary Business Account"
                value={newPaymentMethod.label}
                onChange={(e) => onInputChange('label', e.target.value)}
              />
            </div>

            {newPaymentMethod.type === 'usd' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input 
                    id="routingNumber" 
                    placeholder="Enter routing number"
                    value={newPaymentMethod.details.routingNumber || ''}
                    onChange={(e) => onDetailChange('routingNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input 
                    id="accountNumber" 
                    placeholder="Enter account number"
                    value={newPaymentMethod.details.accountNumber || ''}
                    onChange={(e) => onDetailChange('accountNumber', e.target.value)}
                  />
                </div>
              </div>
            )}

            {newPaymentMethod.type === 'eur' && (
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input 
                  id="iban" 
                  placeholder="Enter IBAN"
                  value={newPaymentMethod.details.iban || ''}
                  onChange={(e) => onDetailChange('iban', e.target.value)}
                />
              </div>
            )}

            {newPaymentMethod.type === 'gbp' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sortCode">Sort Code</Label>
                  <Input 
                    id="sortCode" 
                    placeholder="Enter sort code"
                    value={newPaymentMethod.details.sortCode || ''}
                    onChange={(e) => onDetailChange('sortCode', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gbpAccountNumber">Account Number</Label>
                  <Input 
                    id="gbpAccountNumber" 
                    placeholder="Enter account number"
                    value={newPaymentMethod.details.accountNumber || ''}
                    onChange={(e) => onDetailChange('accountNumber', e.target.value)}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="crypto" className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crypto-type">Currency</Label>
              <Select 
                value="usdc" 
                onValueChange={(value) => onInputChange('type', value)}
              >
                <SelectTrigger id="crypto-type">
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usdc">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crypto-label">Wallet Name</Label>
              <Input 
                id="crypto-label" 
                placeholder="e.g. Solana Wallet"
                value={newPaymentMethod.label}
                onChange={(e) => onInputChange('label', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solanaAddress">Solana Address</Label>
              <Input 
                id="solanaAddress" 
                placeholder="Enter Solana address"
                value={newPaymentMethod.details.solanaAddress || ''}
                onChange={(e) => onDetailChange('solanaAddress', e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center space-x-2 pt-4">
          <input
            type="checkbox"
            id="isDefault"
            checked={newPaymentMethod.isDefault}
            onChange={(e) => onInputChange('isDefault', e.target.checked.toString())}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="isDefault" className="text-sm font-normal">Set as default payment method</Label>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
