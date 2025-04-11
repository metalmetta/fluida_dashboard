
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

const PRIVY_APP_ID = 'cm7ae13h401kawj3tomldpsrf';
const PRIVY_AUTH_KEY = '4oYQp4VhuFGi3poTWYeVvvavZhR1PvapZvE6VEUCbnXNHX98eidKM2Ge9TfihaW39bMtSZHm8iGx58UuS8jVMJWa';

export const createSolanaWallet = async (): Promise<WalletResponse | null> => {
  try {
    const response = await fetch('https://api.privy.io/v1/wallets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'privy-app-id': PRIVY_APP_ID,
        // Note: In a production app, this should be handled server-side
        // The authorization would be managed through a secure backend
        'Authorization': 'Basic ' + btoa(`${PRIVY_APP_ID}:${PRIVY_AUTH_KEY}`)
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
    throw error;
  }
};
