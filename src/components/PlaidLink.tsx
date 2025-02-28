import { useCallback, useState, useEffect } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess } from 'react-plaid-link';
import { Button } from './ui/button';
import { Loader2, Plus } from 'lucide-react';
import { plaidClient } from '@/integrations/plaid/client';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Products, CountryCode } from 'plaid';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface PlaidLinkProps {
  userId: string;
  onSuccess: (bankAccountId: string) => void;
  className?: string;
}

export function PlaidLink({ userId, onSuccess, className }: PlaidLinkProps) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const generateToken = async () => {
    try {
      setLoading(true);
      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'Fluida Dashboard',
        products: ['auth' as Products],
        country_codes: ['US' as CountryCode],
        language: 'en',
      });
      setToken(response.data.link_token);
    } catch (error) {
      console.error('Error generating link token:', error);
      toast.error('Failed to initialize bank linking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateToken();
    }
  }, [isOpen]);

  const handlePlaidSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken, metadata) => {
      try {
        setLoading(true);
        
        // Exchange public token for access token
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
          public_token: publicToken,
        });

        const accessToken = exchangeResponse.data.access_token;
        
        // Get account details
        const authResponse = await plaidClient.authGet({
          access_token: accessToken,
        });

        const account = authResponse.data.accounts[0];
        
        // Save bank account to Supabase
        const { data: bankAccount, error } = await supabase
          .from('bank_accounts')
          .insert([
            {
              user_id: userId,
              name: account.name,
              account_number: account.mask,
              plaid_access_token: accessToken,
              plaid_account_id: account.account_id,
              balance: account.balances.available || 0,
              currency: account.balances.iso_currency_code || 'USD',
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setIsOpen(false);
        toast.success('Bank account linked successfully');
        onSuccess(bankAccount.id);
      } catch (error) {
        console.error('Error in Plaid flow:', error);
        toast.error('Failed to link bank account');
      } finally {
        setLoading(false);
      }
    },
    [userId, onSuccess]
  );

  const config = {
    token,
    onSuccess: handlePlaidSuccess,
    onExit: () => setIsOpen(false),
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (ready && token && isOpen) {
      open();
    }
  }, [ready, token, isOpen, open]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={className}
        variant="outline"
        size="sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Bank Account
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Your Bank Account</DialogTitle>
            <DialogDescription>
              Connect your bank account securely using Plaid.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Connecting to your bank...</p>
              </div>
            ) : (
              <Button onClick={() => open()} disabled={!ready || !token}>
                Continue to Plaid
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 