import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserBalance } from "@/hooks/useUserBalance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USDDepositDetails } from "./deposit/USDDepositDetails";
import { EURDepositDetails } from "./deposit/EURDepositDetails";
interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function DepositDialog({
  open,
  onOpenChange
}: DepositDialogProps) {
  const {
    toast
  } = useToast();
  const {
    updateBalance
  } = useUserBalance();
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
      description: `${label} copied to clipboard`
    });
  };
  const handleSimulateDeposit = () => {
    // Generate a random amount between 10,000 and 100,000
    const randomAmount = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;

    // Create a deposit transaction
    updateBalance(randomAmount, 'Deposit', `Simulated deposit (${selectedCurrency})`).then(() => {
      toast({
        title: "Deposit Simulated",
        description: `${selectedCurrency === "USD" ? "$" : "€"}${randomAmount.toLocaleString()} has been added to your account`
      });

      // Close the dialog
      onOpenChange(false);
    }).catch(error => {
      console.error("Error simulating deposit:", error);
      toast({
        title: "Error",
        description: "Failed to simulate deposit",
        variant: "destructive"
      });
    });
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Use the following banking details to deposit funds to your account.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="usd" className="w-full" onValueChange={value => setSelectedCurrency(value as "USD" | "EUR")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="usd">USD</TabsTrigger>
            <TabsTrigger value="eur">EUR</TabsTrigger>
          </TabsList>
          
          <TabsContent value="usd">
            <USDDepositDetails bankDetails={usdBankDetails} onCopy={handleCopy} />
          </TabsContent>
          
          <TabsContent value="eur">
            <EURDepositDetails bankDetails={euroBankDetails} onCopy={handleCopy} />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-between">
          <div className="text-sm text-muted-foreground">Funds typically appear in a few minutes if sent via Instant SEPA</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSimulateDeposit}>
              Simulate Deposit
            </Button>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}