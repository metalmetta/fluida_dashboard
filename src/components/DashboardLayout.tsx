
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto relative">
          <div className="absolute top-4 right-8 z-50">
            <ThemeToggle />
          </div>
          <div className="container max-w-7xl mx-auto py-8 px-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
