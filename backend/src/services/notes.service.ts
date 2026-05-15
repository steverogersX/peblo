import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { notes, type NoteRow } from "../db/schema";
import type { CreateNoteInput, UpdateNoteInput } from "../lib/schemas";
import { AppError } from "../lib/AppError";

export type SerializedNote = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  visibility: string;
  isArchived: boolean;
  aiSummary?: string;
  aiActionItems?: string[];
  aiGeneratedAt?: string;
  createdAt: string;
  updatedAt: string;
};

function serialize(row: NoteRow): SerializedNote {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags ?? [],
    category: row.category ?? undefined,
    visibility: row.visibility,
    isArchived: row.isArchived,
    aiSummary: row.aiSummary ?? undefined,
    aiActionItems: row.aiActionItems ?? undefined,
    aiGeneratedAt: row.aiGeneratedAt?.toISOString() ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getAllNotes(userId: string): Promise<SerializedNote[]> {
  const rows = await db.select().from(notes).where(eq(notes.userId, userId));
  return rows.map(serialize);
}

export async function createNote(userId: string, input: CreateNoteInput): Promise<SerializedNote> {
  const { id, ...rest } = input;
  const values = id !== undefined ? { id, userId, ...rest } : { userId, ...rest };
  const [row] = await db.insert(notes).values(values).returning();
  return serialize(row);
}

export async function updateNote(userId: string, id: string, input: UpdateNoteInput): Promise<SerializedNote> {
  const [row] = await db
    .update(notes)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();
  if (!row) throw AppError.notFound("Note");
  return serialize(row);
}

export async function deleteNote(userId: string, id: string): Promise<string> {
  const [row] = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning({ id: notes.id });
  if (!row) throw AppError.notFound("Note");
  return row.id;
}
