
import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubtitleCardProps {
  text: string;
  tooltip?: string;
  className?: string;
}

export function SubtitleCard({ text, tooltip, className }: SubtitleCardProps) {
  return (
    <Card className={cn("p-6 mb-8 bg-muted/50 border-muted", className)}>
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">{text}</p>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </Card>
  );
}
