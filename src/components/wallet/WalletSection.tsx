
import { WalletResponse } from "@/utils/privyApi";
import { useWallet } from "@/hooks/useWallet";
import { WalletDisplay } from "@/components/wallet/WalletDisplay";
import { CreateWalletButton } from "@/components/wallet/CreateWalletButton";

export function WalletSection() {
  const { wallet, isCreating, createWallet } = useWallet();

  const handleCreateWallet = async () => {
    await createWallet();
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Wallet</h4>
      {wallet ? (
        <WalletDisplay wallet={wallet} />
      ) : (
        <CreateWalletButton 
          isCreating={isCreating} 
          onClick={handleCreateWallet} 
        />
      )}
    </div>
  );
}
