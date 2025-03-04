import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { Home, DollarSign, Users, FileText, LogOut, Settings, ChevronDown, Users2 } from "lucide-react";
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
  label: "Bills",
  href: "/bills"
}, {
  icon: Users2,
  label: "Team",
  href: "/team"
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

  const userInitial = session?.user.email ? session.user.email[0].toUpperCase() : "U";

  const isActive = (path: string) => {
    return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  };

  return <Sidebar>
      <SidebarHeader className="p-6 bg-slate-50">
        <div className="flex items-center gap-2">
          <a 
            href="/" 
            className="block transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg"
          >
            <img 
              src="/lovable-uploads/c5fcd48a-5238-4a4a-8441-d0012df26e15.svg" 
              alt="Fluida Logo" 
              className="h-16 w-auto"
            />
          </a>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-slate-50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground px-4">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild data-active={isActive(item.href)}>
                    <a 
                      href={item.href} 
                      className={cn(
                        "flex items-center gap-3 relative px-4 py-2 rounded-lg transition-all duration-200",
                        "hover:bg-primary/5",
                        isActive(item.href) && [
                          "font-medium text-primary",
                          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                          "before:h-8 before:w-1 before:bg-primary before:rounded-full",
                          "before:transition-all before:duration-200"
                        ]
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors duration-200",
                        isActive(item.href) ? "text-primary" : "text-muted-foreground",
                        "group-hover:text-primary"
                      )} />
                      <span className="transition-colors duration-200 group-hover:text-primary">{item.label}</span>
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
              <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none w-full p-2 rounded-lg hover:bg-primary/5 transition-colors duration-200">
                <Avatar className="h-8 w-8 flex-shrink-0 transition-transform duration-200 hover:scale-105">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm min-w-0 flex-1">
                  <div className="font-medium truncate max-w-[120px]">
                    {session?.user.email}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-hover:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <a href="/settings" className="flex items-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-primary/5">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-600 cursor-pointer transition-colors duration-200">
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
