
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
  description?: string;
  statusFilters: StatusFilter[];
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  actionButtons: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  }[];
}

export function DocumentsHeader({
  title,
  description,
  statusFilters,
  selectedStatus,
  onStatusChange,
  actionButtons,
}: DocumentsHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="flex gap-3">
          {actionButtons.map((button, index) => (
            <Button 
              key={index} 
              variant={button.variant || "default"} 
              onClick={button.onClick}
            >
              <button.icon className="h-4 w-4 mr-2" />
              {button.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-8 border-b pb-1">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onStatusChange(selectedStatus === filter.value ? null : filter.value)}
            className={`flex items-center gap-2 pb-2 ${
              selectedStatus === filter.value ? "border-b-2 border-primary" : ""
            }`}
          >
            {filter.label}
            <Badge variant="secondary" className="rounded-full">{filter.count}</Badge>
          </button>
        ))}
      </div>
    </>
  );
}
