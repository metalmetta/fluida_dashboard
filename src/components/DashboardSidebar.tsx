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
import { FileText, CreditCard, Receipt, Users, Settings, HelpCircle, LogOut } from "lucide-react";
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
    <Sidebar className="flex flex-col justify-between">
      <div>
        <SidebarHeader className="p-4">
          <h2 className="text-lg font-semibold">VendorPay</h2>
        </SidebarHeader>
        <SidebarContent>
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
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar />
          <div>
            <p className="font-medium">John Doe</p>
            <p className="text-sm text-muted-foreground">john@example.com</p>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
