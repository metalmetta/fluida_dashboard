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
import { useNavigate } from "react-router-dom";

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

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <Sidebar className="flex flex-col h-screen">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">Fluida</h2>
      </SidebarHeader>
      
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.href)}
                    className="flex items-center gap-3 w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto border-t">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 w-full p-4 hover:bg-secondary/50 transition-colors">
            <Avatar />
            <div className="text-left flex-1">
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-muted-foreground">john@example.com</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-56">
            {userMenuItems.map((item) => (
              <DropdownMenuItem 
                key={item.label} 
                onClick={() => handleNavigation(item.href)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Sidebar>
  );
}
