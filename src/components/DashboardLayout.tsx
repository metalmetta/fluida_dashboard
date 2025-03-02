import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
export const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto bg-zinc-100">
          <div className="container max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm rounded-lg my-4">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>;
};