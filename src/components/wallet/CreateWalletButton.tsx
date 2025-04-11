
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";

interface CreateWalletButtonProps {
  isCreating: boolean;
  onClick: () => void;
}

export function CreateWalletButton({ isCreating, onClick }: CreateWalletButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full mt-4"
      onClick={onClick}
      disabled={isCreating}
    >
      {isCreating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Wallet...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Create Wallet
        </>
      )}
    </Button>
  );
}
