
import { useState } from "react";
import { createSolanaWallet, WalletResponse } from "@/utils/privyApi";
import { toast } from "@/hooks/use-toast";

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createWallet = async () => {
    setIsCreating(true);
    try {
      const newWallet = await createSolanaWallet();
      if (newWallet) {
        setWallet(newWallet);
        toast({
          title: "Wallet Created Successfully",
          description: `Your Solana wallet has been created with address: ${newWallet.address.slice(0, 8)}...${newWallet.address.slice(-6)}`,
        });
        return newWallet;
      }
    } catch (error) {
      console.error("Error in useWallet hook:", error);
      toast({
        title: "Wallet Creation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
    return null;
  };

  return {
    wallet,
    isCreating,
    createWallet,
  };
};
