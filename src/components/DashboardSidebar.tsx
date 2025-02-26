
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
  SidebarMenuSub,
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
import { cn } from "@/lib/utils";

interface MenuSection {
  icon: React.ComponentType;
  label: string;
  href?: string;
  items?: {
    icon: React.ComponentType;
    label: string;
    href: string;
  }[];
}

const menuSections: MenuSection[] = [
  {
    icon: Home,
    label: "Overview",
    items: [
      { icon: Home, label: "Dashboard", href: "/" },
      { icon: PieChart, label: "Analytics", href: "/analytics" },
    ],
  },
  {
    icon: DollarSign,
    label: "Payments",
    items: [
      { icon: DollarSign, label: "Transactions", href: "/transactions" },
      { icon: ArrowLeftRight, label: "Transfers", href: "/transfers" },
      { icon: Wallet, label: "Balances", href: "/balances" },
    ],
  },
  {
    icon: Users,
    label: "Vendors",
    items: [
      { icon: Users, label: "All Vendors", href: "/vendors" },
      { icon: Building2, label: "Companies", href: "/companies" },
      { icon: CreditCard, label: "Payment Methods", href: "/payment-methods" },
    ],
  },
  {
    icon: FileText,
    label: "Documents",
    items: [
      { icon: FileText, label: "Invoices", href: "/invoices" },
      { icon: Receipt, label: "Receipts", href: "/receipts" },
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings"
  }
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
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-lg font-semibold">VendorPay</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuSections.map((section) => (
                <SidebarMenuItem key={section.label}>
                  {section.items ? (
                    <>
                      <SidebarMenuButton
                        onClick={() => toggleSection(section.label)}
                        className={cn(
                          "w-full justify-between",
                          expandedSections.includes(section.label) &&
                            "bg-accent text-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <section.icon className="h-4 w-4" />
                          <span>{section.label}</span>
                        </div>
                        {expandedSections.includes(section.label) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </SidebarMenuButton>
                      {expandedSections.includes(section.label) && (
                        <SidebarMenuSub>
                          {section.items.map((item) => (
                            <SidebarMenuItem key={item.label}>
                              <SidebarMenuButton asChild>
                                <a
                                  href={item.href}
                                  className="flex items-center gap-3"
                                >
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <a href={section.href} className="flex items-center gap-3">
                        <section.icon className="h-4 w-4" />
                        <span>{section.label}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
