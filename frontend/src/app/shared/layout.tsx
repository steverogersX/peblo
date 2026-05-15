import { NotesProvider } from "@/contexts/NotesContext";
import { Sidebar } from "@/components/layout/Sidebar";

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotesProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden bg-background">
          {children}
        </main>
      </div>
    </NotesProvider>
  );
}
