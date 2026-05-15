import { eq } from "drizzle-orm";
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

export async function getAllNotes(): Promise<SerializedNote[]> {
  const rows = await db.select().from(notes);
  return rows.map(serialize);
}

export async function createNote(input: CreateNoteInput): Promise<SerializedNote> {
  const { id, ...rest } = input;
  const values = id !== undefined ? { id, ...rest } : rest;
  const [row] = await db.insert(notes).values(values).returning();
  return serialize(row);
}

export async function updateNote(id: string, input: UpdateNoteInput): Promise<SerializedNote> {
  const [row] = await db
    .update(notes)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(notes.id, id))
    .returning();
  if (!row) throw AppError.notFound("Note");
  return serialize(row);
}

export async function deleteNote(id: string): Promise<string> {
  const [row] = await db
    .delete(notes)
    .where(eq(notes.id, id))
    .returning({ id: notes.id });
  if (!row) throw AppError.notFound("Note");
  return row.id;
}
