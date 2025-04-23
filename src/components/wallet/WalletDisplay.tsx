
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletResponse } from "@/utils/privyApi";
import { Check, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WalletDisplayProps {
  wallet: WalletResponse;
}

export function WalletDisplay({ wallet }: WalletDisplayProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 border rounded-md p-3 bg-muted/20">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Solana Wallet</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={() => copyToClipboard(wallet.address)}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground font-mono truncate">
        {wallet.address}
      </p>
    </div>
  );
}
