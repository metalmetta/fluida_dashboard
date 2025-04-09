
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, CreditCard, Building, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserBalance } from "@/hooks/useUserBalance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositDialog({ open, onOpenChange }: DepositDialogProps) {
  const { toast } = useToast();
  const { updateBalance } = useUserBalance();
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "EUR">("USD");
  
  const usdBankDetails = {
    accountName: "Fluida Finance Inc.",
    routingNumber: "021000021",
    accountNumber: "9876543210",
    bankName: "JP Morgan Chase",
    address: "270 Park Avenue, New York, NY 10017",
    swiftCode: "CHASUS33"
  };

  const euroBankDetails = {
    accountName: "Fluida Finance Europe",
    iban: "DE89 3704 0044 0532 0130 00",
    bic: "COBADEFFXXX",
    bankName: "Commerzbank AG",
    address: "Kaiserplatz, 60311 Frankfurt am Main, Germany",
    reference: "FLUIDA-EUR"
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSimulateDeposit = () => {
    // Generate a random amount between 10,000 and 100,000
    const randomAmount = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;
    
    // Create a deposit transaction
    updateBalance(randomAmount, 'Deposit', `Simulated deposit (${selectedCurrency})`)
      .then(() => {
        toast({
          title: "Deposit Simulated",
          description: `${selectedCurrency === "USD" ? "$" : "€"}${randomAmount.toLocaleString()} has been added to your account`,
        });
        
        // Close the dialog
        onOpenChange(false);
      })
      .catch((error) => {
        console.error("Error simulating deposit:", error);
        toast({
          title: "Error",
          description: "Failed to simulate deposit",
          variant: "destructive",
        });
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Use the following banking details to deposit funds to your account.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="usd" className="w-full" onValueChange={(value) => setSelectedCurrency(value as "USD" | "EUR")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="usd">USD</TabsTrigger>
            <TabsTrigger value="eur">EUR</TabsTrigger>
          </TabsList>
          
          <TabsContent value="usd" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">ACH Instructions</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Name</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{usdBankDetails.accountName}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(usdBankDetails.accountName, "Account name")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Routing Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{usdBankDetails.routingNumber}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(usdBankDetails.routingNumber, "Routing number")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{usdBankDetails.accountNumber}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(usdBankDetails.accountNumber, "Account number")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bank Name</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{usdBankDetails.bankName}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(usdBankDetails.bankName, "Bank name")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">WIRE Instructions</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">SWIFT Code</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{usdBankDetails.swiftCode}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(usdBankDetails.swiftCode, "SWIFT code")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bank Address</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{usdBankDetails.address}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(usdBankDetails.address, "Bank address")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{usdBankDetails.accountNumber}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(usdBankDetails.accountNumber, "Account number")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="eur" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">SEPA Instructions</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Name</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{euroBankDetails.accountName}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(euroBankDetails.accountName, "Account name")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">IBAN</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{euroBankDetails.iban}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(euroBankDetails.iban, "IBAN")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">BIC/SWIFT</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{euroBankDetails.bic}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(euroBankDetails.bic, "BIC/SWIFT")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bank Name</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{euroBankDetails.bankName}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(euroBankDetails.bankName, "Bank name")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bank Address</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{euroBankDetails.address}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(euroBankDetails.address, "Bank address")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Reference</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{euroBankDetails.reference}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(euroBankDetails.reference, "Reference")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Funds typically appear in 1-3 business days.
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSimulateDeposit}
            >
              Simulate Deposit
            </Button>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
