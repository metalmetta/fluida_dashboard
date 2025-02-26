
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
import {
  Home,
  DollarSign,
  Users,
  FileText,
  Settings,
  Building2,
  CreditCard,
  Receipt,
  PieChart,
  ChevronDown,
  ChevronRight,
  Wallet,
  ArrowLeftRight,
} from "lucide-react";
import { useState } from "react";

interface MenuSection {
  label: string;
  items: {
    icon: React.ComponentType;
    label: string;
    href: string;
  }[];
}

const menuSections: MenuSection[] = [
  {
    label: "Overview",
    items: [
      { icon: Home, label: "Dashboard", href: "/" },
      { icon: PieChart, label: "Analytics", href: "/analytics" },
    ],
  },
  {
    label: "Payments",
    items: [
      { icon: DollarSign, label: "Transactions", href: "/transactions" },
      { icon: ArrowLeftRight, label: "Transfers", href: "/transfers" },
      { icon: Wallet, label: "Balances", href: "/balances" },
    ],
  },
  {
    label: "Vendors",
    items: [
      { icon: Users, label: "All Vendors", href: "/vendors" },
      { icon: Building2, label: "Companies", href: "/companies" },
      { icon: CreditCard, label: "Payment Methods", href: "/payment-methods" },
    ],
  },
  {
    label: "Documents",
    items: [
      { icon: FileText, label: "Invoices", href: "/invoices" },
      { icon: Receipt, label: "Receipts", href: "/receipts" },
    ],
  },
];

export function DashboardSidebar() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["Overview"]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">VendorPay</h2>
      </SidebarHeader>
      <SidebarContent>
        {menuSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel
              className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors"
              onClick={() => toggleSection(section.label)}
            >
              {section.label}
              {expandedSections.includes(section.label) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent
              className={`transition-all duration-200 ease-out overflow-hidden ${
                expandedSections.includes(section.label)
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <a href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/settings" className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
