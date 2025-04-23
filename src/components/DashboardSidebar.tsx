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
import { FileText, CreditCard, Receipt, Users, Settings, HelpCircle, LogOut, ArrowRightLeft } from "lucide-react";
import { UserCard } from "@/components/ui/user-card";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

const menuItems = [
  { icon: FileText, label: "Invoices", href: "/invoices" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: Receipt, label: "Bills", href: "/bills" },
  { icon: ArrowRightLeft, label: "Internal Transfer", href: "/internal-transfer" },
  { icon: Users, label: "Contacts", href: "/contacts" },
];

const userMenuItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Support", href: "/support" },
  { icon: LogOut, label: "Logout", action: "logout" },
];

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url, full_name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }

          if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    }

    fetchUserProfile();
  }, [user]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleUserAction = async (action: string | undefined, href: string | undefined) => {
    if (action === "logout") {
      try {
        await signOut();
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        });
        navigate("/auth");
      } catch (error: any) {
        toast({
          title: "Error signing out",
          description: error.message || "There was a problem signing out.",
          variant: "destructive",
        });
      }
    } else if (href) {
      navigate(href);
    }
  };

  const userEmail = user?.email || "user@example.com";
  const userName = user?.user_metadata?.full_name || userEmail.split("@")[0];

  const mappedUserMenuItems = userMenuItems.map(item => ({
    ...item,
    isActive: item.href ? location.pathname === item.href : false
  }));

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
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
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        onClick={() => handleNavigation(item.href)}
                        className={`flex items-center gap-3 w-full relative ${
                          isActive ? 'text-[#2606EB] bg-[#2606EB]/5 dark:text-primary dark:bg-primary/10' : ''
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2606EB] dark:bg-primary rounded-r" />
                        )}
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-[#2606EB] dark:text-primary' : ''}`} />
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
          <div className="p-4 flex justify-between items-center">
            <ThemeToggle />
          </div>
          <UserCard
            userName={userName}
            userEmail={userEmail}
            avatarUrl={avatarUrl}
            menuItems={mappedUserMenuItems}
            onMenuItemClick={handleUserAction}
          />
        </div>
      </Sidebar>
    </div>
  );
}
