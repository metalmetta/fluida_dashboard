
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FileText, CreditCard, Receipt, Users, Settings, HelpCircle, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { icon: FileText, label: "Invoices", href: "/invoices" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: Receipt, label: "Bills", href: "/bills" },
  { icon: Users, label: "Contacts", href: "/contacts" },
];

const userMenuItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Support", href: "/support" },
  { icon: LogOut, label: "Logout", href: "/logout" },
];

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      <Sidebar className="flex flex-col h-screen">
        <SidebarHeader className="p-4">
          <button 
            onClick={() => handleNavigation("/")}
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-28 w-auto"
            />
          </button>
        </SidebarHeader>
        
        <SidebarContent className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        onClick={() => handleNavigation(item.href)}
                        className={`flex items-center gap-3 w-full relative ${
                          isActive ? 'text-[#2606EB] bg-[#2606EB]/5' : ''
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2606EB] rounded-r" />
                        )}
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-[#2606EB]' : ''}`} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className="mt-auto border-t">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 w-full p-4 hover:bg-secondary/50 transition-colors">
              <Avatar />
              <div className="text-left flex-1">
                <p className="font-medium">{user?.fullName || "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email || "user@example.com"}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="w-56">
              {userMenuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <DropdownMenuItem 
                    key={item.label} 
                    onClick={() => handleNavigation(item.href)}
                    className={`flex items-center gap-2 cursor-pointer ${
                      isActive ? 'text-[#2606EB] bg-[#2606EB]/5' : ''
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-[#2606EB]' : ''}`} />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Sidebar>
    </div>
  );
}
