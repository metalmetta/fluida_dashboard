
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StatusFilter {
  value: string;
  label: string;
  count: number;
}

interface DocumentsHeaderProps {
  title: string;
  statusFilters: StatusFilter[];
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  actionButtons: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  }[];
  additionalActions?: React.ReactNode;
}

export function DocumentsHeader({
  title,
  statusFilters,
  selectedStatus,
  onStatusChange,
  actionButtons,
  additionalActions,
}: DocumentsHeaderProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex gap-3">
          {actionButtons.map((button, index) => (
            <Button 
              key={index} 
              variant={button.variant || "default"} 
              onClick={button.onClick}
              className="shadow-sm transition-all hover:shadow-md"
            >
              <button.icon className="h-4 w-4 mr-2" />
              {button.label}
            </Button>
          ))}
          {additionalActions}
        </div>
      </div>

      <div className="flex gap-6">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onStatusChange(selectedStatus === filter.value ? null : filter.value)}
            className={`flex items-center gap-2 py-2 transition-all hover:opacity-80 ${
              selectedStatus === filter.value 
                ? "border-b-2 border-primary font-medium" 
                : "text-muted-foreground"
            }`}
          >
            {filter.label}
            <Badge variant="secondary" className="rounded-full font-normal">
              {filter.count}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
