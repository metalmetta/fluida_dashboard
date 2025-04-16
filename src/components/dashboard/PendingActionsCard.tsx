
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface UserAction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  icon: string | null;
}

interface PendingActionsCardProps {
  actions: UserAction[];
  isLoading: boolean;
  getActionIcon: (iconName: string | null) => React.ElementType;
}

export function PendingActionsCard({ actions, isLoading, getActionIcon }: PendingActionsCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Pending Actions</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
        </div>
      ) : actions.length > 0 ? (
        <div className="space-y-4">
          {actions.map((action) => {
            const ActionIcon = getActionIcon(action.icon);
            return (
              <div
                key={action.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <ActionIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{action.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(action.amount, action.currency)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={action.status.includes("2/2") ? "success" : "outline"}
                >
                  {action.status}
                </Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No pending actions</p>
        </div>
      )}
    </Card>
  );
}
