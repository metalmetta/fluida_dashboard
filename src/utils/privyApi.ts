
import { toast } from "@/hooks/use-toast";

// Types for wallet responses
export interface WalletResponse {
  id: string;
  address: string;
  chain_type: string;
  policy_ids: string[];
  owner_id: string | null;
  additional_signers: string[];
  created_at: number;
}

export const createSolanaWallet = async (): Promise<WalletResponse | null> => {
  try {
    const response = await fetch('https://api.privy.io/v1/wallets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'privy-app-id': 'cm7ae13h401kawj3tomldpsrf',
        // Note: In a production app, this should be handled server-side
        // The authorization would be managed through a secure backend
        'Authorization': 'Basic ' + btoa('cm7ae13h401kawj3tomldpsrf:4oYQp4VhuFGi3poTWYeVvvavZhR1PvapZvE6VEUCbnXNHX98eidKM2Ge9TfihaW39bMtSZHm8iGx58UuS8jVMJWa')
      },
      body: JSON.stringify({
        chain_type: "solana"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create wallet');
    }

    const data = await response.json();
    return data as WalletResponse;
  } catch (error) {
    console.error('Error creating wallet:', error);
    toast({
      title: "Wallet Creation Failed",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
};
