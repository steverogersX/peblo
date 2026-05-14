import { NoteList } from "@/components/notes/NoteList";
import { NoteEditor } from "@/components/notes/NoteEditor";

export default function NotesPage() {
  return (
    <>
      <NoteList />
      <NoteEditor />
    </>
  );
}
