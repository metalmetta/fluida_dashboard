
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface BankDetailsItemProps {
  label: string;
  value: string;
  onCopy: (text: string, label: string) => void;
}

export function BankDetailsItem({ label, value, onCopy }: BankDetailsItemProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => onCopy(value, label)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
