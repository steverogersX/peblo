import { NotesProvider } from "@/contexts/NotesContext";
import { Sidebar } from "@/components/layout/Sidebar";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotesProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 overflow-hidden">{children}</div>
      </div>
    </NotesProvider>
  );
}
