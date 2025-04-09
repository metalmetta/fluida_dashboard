
import { Separator } from "@/components/ui/separator";
import { BankDetailsItem } from "./BankDetailsItem";
import { LucideIcon } from "lucide-react";

interface BankDetailsSectionProps {
  title: string;
  icon: LucideIcon;
  details: Array<{
    label: string;
    value: string;
  }>;
  onCopy: (text: string, label: string) => void;
}

export function BankDetailsSection({ title, icon: Icon, details, onCopy }: BankDetailsSectionProps) {
  return (
    <div className="bg-muted p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        {details.map((detail) => (
          <BankDetailsItem
            key={detail.label}
            label={detail.label}
            value={detail.value}
            onCopy={onCopy}
          />
        ))}
      </div>
    </div>
  );
}
