
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserCardProps {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  menuItems: {
    icon: React.ElementType;
    label: string;
    href?: string;
    action?: string;
    isActive?: boolean;
  }[];
  onMenuItemClick: (action: string | undefined, href: string | undefined) => void;
  className?: string;
}

export function UserCard({
  userName,
  userEmail,
  avatarUrl,
  menuItems,
  onMenuItemClick,
  className,
}: UserCardProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("p-3 w-full", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200 flex items-center gap-3 w-full">
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={userName} />
              ) : (
                <AvatarFallback className="bg-primary/5 text-primary">
                  {getInitials(userName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-left flex-1 overflow-hidden">
              <p className="font-medium text-sm truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-56">
          {menuItems.map((item) => (
            <DropdownMenuItem 
              key={item.label} 
              onClick={() => onMenuItemClick(item.action, item.href)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                item.isActive ? 'text-[#2606EB] bg-[#2606EB]/5' : ''
              )}
            >
              <item.icon className={cn("h-4 w-4", item.isActive ? 'text-[#2606EB]' : '')} />
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
