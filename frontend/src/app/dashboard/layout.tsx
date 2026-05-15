import { DashboardProvider } from "@/contexts/DashboardContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header title="Dashboard" />
          <main className="flex-1 overflow-y-auto bg-background">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}
