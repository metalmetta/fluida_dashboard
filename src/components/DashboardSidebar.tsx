import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { Home, DollarSign, Users, FileText, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
const menuItems = [{
  icon: Home,
  label: "Home",
  href: "/"
}, {
  icon: DollarSign,
  label: "Transactions",
  href: "/transactions"
}, {
  icon: Users,
  label: "Vendors",
  href: "/vendors"
}, {
  icon: FileText,
  label: "Invoices",
  href: "/invoices"
}];
export function DashboardSidebar() {
  const {
    session
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast.error("Error logging out");
    }
  };

  // Extract user's email first letter for avatar fallback
  const userInitial = session?.user.email ? session.user.email[0].toUpperCase() : "U";

  // Function to check if a menu item is active
  const isActive = (path: string) => {
    // Exact match for home page, or starts with for other pages
    return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  };
  return <Sidebar>
      <SidebarHeader className="p-4 bg-slate-50">
        <h2 className="add logo next to it\n">Fluida</h2>
      </SidebarHeader>
      <SidebarContent className="bg-slate-50">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild data-active={isActive(item.href)}>
                    <a href={item.href} className={cn("flex items-center gap-3 relative", isActive(item.href) && "font-medium text-primary before:absolute before:left-[-10px] before:top-0 before:h-full before:w-1 before:bg-primary before:rounded-full")}>
                      <item.icon className={cn("h-4 w-4", isActive(item.href) && "text-primary")} />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-slate-50">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{session?.user.email}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <a href="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>;
}