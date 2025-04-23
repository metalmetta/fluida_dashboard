
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";

interface CreateWalletButtonProps {
  isCreating: boolean;
  onClick: () => void;
}

export function CreateWalletButton({ isCreating, onClick }: CreateWalletButtonProps) {
  return (
    <Button
      variant="default"
      className="w-full mt-6"
      onClick={onClick}
      disabled={isCreating}
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating Wallet...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Create Wallet
        </>
      )}
    </Button>
  );
}
