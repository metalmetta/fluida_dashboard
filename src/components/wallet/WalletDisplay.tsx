
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
    <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-900">Solana Wallet</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900" 
          onClick={() => copyToClipboard(wallet.address)}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-sm text-gray-600 font-mono truncate">
        {wallet.address}
      </p>
    </div>
  );
}
