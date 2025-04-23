
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-6xl mx-auto py-12 px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
