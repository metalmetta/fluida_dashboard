import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod } from "@/types/invoice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet, DollarSign, Euro, PoundSterling, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PaymentMethods() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("fiat");
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
        return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Payment Methods</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
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
                    onValueChange={(value) => handleInputChange('type', value)}
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
                    onChange={(e) => handleInputChange('label', e.target.value)}
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
                        onChange={(e) => handleDetailChange('routingNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input 
                        id="accountNumber" 
                        placeholder="Enter account number"
                        value={newPaymentMethod.details.accountNumber || ''}
                        onChange={(e) => handleDetailChange('accountNumber', e.target.value)}
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
                      onChange={(e) => handleDetailChange('iban', e.target.value)}
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
                        onChange={(e) => handleDetailChange('sortCode', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gbpAccountNumber">Account Number</Label>
                      <Input 
                        id="gbpAccountNumber" 
                        placeholder="Enter account number"
                        value={newPaymentMethod.details.accountNumber || ''}
                        onChange={(e) => handleDetailChange('accountNumber', e.target.value)}
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
                    onValueChange={(value) => handleInputChange('type', value)}
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
                    onChange={(e) => handleInputChange('label', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solanaAddress">Solana Address</Label>
                  <Input 
                    id="solanaAddress" 
                    placeholder="Enter Solana address"
                    value={newPaymentMethod.details.solanaAddress || ''}
                    onChange={(e) => handleDetailChange('solanaAddress', e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                id="isDefault"
                checked={newPaymentMethod.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked.toString())}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isDefault" className="text-sm font-normal">Set as default payment method</Label>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <p>Loading payment methods...</p>
        </div>
      ) : paymentMethods.length === 0 ? (
        <Card className="p-6 flex flex-col items-center justify-center space-y-2 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No payment methods</h3>
          <p className="text-muted-foreground">Add bank accounts or wallet addresses to receive payments</p>
          <Button className="mt-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="p-4">
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
                      onClick={() => setDefaultPaymentMethod(method.id)}
                    >
                      Make Default
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deletePaymentMethod(method.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
