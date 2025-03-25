
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";

interface EmptyStateProps {
  onAddNew: () => void;
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center space-y-2 text-center">
      <CreditCard className="h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-medium">No payment methods</h3>
      <p className="text-muted-foreground">Add bank accounts or wallet addresses to receive payments</p>
      <Button className="mt-2" onClick={onAddNew}>
        <Plus className="h-4 w-4 mr-2" />
        Add Payment Method
      </Button>
    </Card>
  );
}
