
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SubtitleCardProps {
  text: string;
  tooltip?: string;
  className?: string;
  avatarUrl?: string;
  name?: string;
  email?: string;
}

export function SubtitleCard({ 
  text, 
  tooltip, 
  className, 
  avatarUrl,
  name,
  email
}: SubtitleCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none shadow-md", className)}>
      <CardContent className="p-0">
        {avatarUrl || name || email ? (
          <div className="flex items-center gap-4 p-5 bg-white rounded-lg">
            {avatarUrl && (
              <Avatar className="h-14 w-14 border-2 border-primary/10">
                <AvatarImage src={avatarUrl} alt={name || "Profile"} />
                <AvatarFallback>
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              {name && <h3 className="font-semibold text-lg truncate">{name}</h3>}
              {email && (
                <a 
                  href={`mailto:${email}`} 
                  className="text-primary hover:underline truncate block"
                >
                  {email}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-secondary/50 to-secondary/30">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded-full p-1.5 bg-white/90 shadow-sm cursor-help">
                      <InfoIcon className="h-4 w-4 text-primary flex-shrink-0" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-white border border-gray-100 shadow-lg">
                    <p className="text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
