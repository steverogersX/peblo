import { randomUUID } from "crypto";
import { and, eq, or, lt, desc, isNotNull } from "drizzle-orm";
import { generateObject } from "ai";
import { createMistral } from "@ai-sdk/mistral";
import { z } from "zod";
import { db } from "../db";
import { notes, users, type NoteRow } from "../db/schema";
import type { CreateNoteInput, UpdateNoteInput } from "../lib/schemas";
import { AppError } from "../lib/AppError";
import { env } from "../config/env";

export type SerializedNote = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  visibility: string;
  isArchived: boolean;
  shareLinkPermission: string;
  shareToken: string | null;
  aiSummary?: string;
  aiActionItems?: string[];
  aiGeneratedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicNote = Omit<SerializedNote, "shareToken"> & { ownerName: string };

export type PaginatedNotes = {
  notes: SerializedNote[];
  nextCursor: string | null;
  hasMore: boolean;
};

const PAGE_SIZE = 25;

function encodeCursor(updatedAt: Date, id: string): string {
  return Buffer.from(JSON.stringify({ updatedAt: updatedAt.toISOString(), id })).toString("base64url");
}

function decodeCursor(cursor: string): { updatedAt: Date; id: string } | null {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
      updatedAt: string;
      id: string;
    };
    return { updatedAt: new Date(parsed.updatedAt), id: parsed.id };
  } catch {
    return null;
  }
}

function serialize(row: NoteRow): SerializedNote {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags ?? [],
    category: row.category ?? undefined,
    visibility: row.visibility,
    isArchived: row.isArchived,
    shareLinkPermission: row.shareLinkPermission,
    shareToken: row.shareToken ?? null,
    aiSummary: row.aiSummary ?? undefined,
    aiActionItems: row.aiActionItems ?? undefined,
    aiGeneratedAt: row.aiGeneratedAt?.toISOString() ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}


export async function getAllNotes(
  userId: string,
  cursor?: string,
  limit = PAGE_SIZE
): Promise<PaginatedNotes> {
  const cursorData = cursor ? decodeCursor(cursor) : null;

  const userFilter = eq(notes.userId, userId);
  const cursorFilter = cursorData
    ? or(
        lt(notes.updatedAt, cursorData.updatedAt),
        and(eq(notes.updatedAt, cursorData.updatedAt), lt(notes.id, cursorData.id))
      )
    : undefined;

  const rows = await db
    .select()
    .from(notes)
    .where(cursorFilter ? and(userFilter, cursorFilter) : userFilter)
    .orderBy(desc(notes.updatedAt), desc(notes.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.updatedAt, last.id) : null;

  return { notes: page.map(serialize), nextCursor, hasMore };
}

export async function createNote(userId: string, input: CreateNoteInput): Promise<SerializedNote> {
  const { id, ...rest } = input;
  const values = id !== undefined ? { id, userId, ...rest } : { userId, ...rest };
  const [row] = await db.insert(notes).values(values).returning();
  return serialize(row);
}

export async function updateNote(userId: string, id: string, input: UpdateNoteInput): Promise<SerializedNote> {
  const patch: Record<string, unknown> = { ...input, updatedAt: new Date() };

  // Derive visibility from share state
  if (input.shareLinkPermission !== undefined) {
    patch.visibility = input.shareLinkPermission !== "none" ? "public" : "private";
  }

  // Lazily generate a share token the first time sharing is enabled
  if (input.shareLinkPermission && input.shareLinkPermission !== "none") {
    const [existing] = await db
      .select({ shareToken: notes.shareToken })
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    if (existing && !existing.shareToken) {
      patch.shareToken = randomUUID();
    }
  }

  const [row] = await db
    .update(notes)
    .set(patch)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();
  if (!row) throw AppError.notFound("Note");
  return serialize(row);
}

async function fetchPublicRow(token: string) {
  const [result] = await db
    .select({ note: notes, ownerName: users.name })
    .from(notes)
    .innerJoin(users, eq(notes.userId, users.id))
    .where(and(eq(notes.shareToken, token), isNotNull(notes.shareToken)));
  return result ?? null;
}

export async function getPublicNoteByToken(token: string): Promise<PublicNote> {
  const result = await fetchPublicRow(token);
  if (!result || result.note.shareLinkPermission === "none") throw AppError.notFound("Note");
  const { shareToken: _token, ...rest } = serialize(result.note);
  return { ...rest, ownerName: result.ownerName };
}

export async function updatePublicNote(
  token: string,
  input: { title?: string; content?: string }
): Promise<PublicNote> {
  const result = await fetchPublicRow(token);
  if (!result) throw AppError.notFound("Note");
  if (result.note.shareLinkPermission !== "edit") {
    throw AppError.forbidden("Note is not editable via share link");
  }
  const [updated] = await db
    .update(notes)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(notes.id, result.note.id))
    .returning();
  const { shareToken: _token, ...rest } = serialize(updated);
  return { ...rest, ownerName: result.ownerName };
}

export async function deleteNote(userId: string, id: string): Promise<string> {
  const [row] = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning({ id: notes.id });
  if (!row) throw AppError.notFound("Note");
  return row.id;
}

export type SummarizeResult = {
  note: SerializedNote;
  suggestedTitle: string;
};

export async function summarizeNote(userId: string, noteId: string): Promise<SummarizeResult> {
  const [row] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
  if (!row) throw AppError.notFound("Note");

  const plain = (row.content || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*`_[\]()>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const { summary: aiSummary, actionItems: aiActionItems, suggestedTitle } = await callAI(row.title, plain);

  const [updated] = await db
    .update(notes)
    .set({ aiSummary, aiActionItems, aiGeneratedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  return { note: serialize(updated), suggestedTitle };
}

const noteSchema = z.object({
  summary: z.string().describe("A detailed summary of the note between 500 and 1000 characters. Cover the main points, context, and key details. Write 'The note is empty.' if there is no content."),
  actionItems: z.array(z.string()).max(5).describe("Up to 5 actionable tasks found in the note. Empty array if none."),
  suggestedTitle: z.string().describe("The current title if already clear and accurate, otherwise a concise improvement."),
});

async function callAI(title: string, plainContent: string): Promise<z.infer<typeof noteSchema>> {
  const mistral = createMistral({ apiKey: env.MISTRAL_API_KEY });
  const model = env.MISTRAL_MODEL;
  const snippet = plainContent.slice(0, 12000);

  try {
    const { object } = await generateObject({
      model: mistral(model),
      schema: noteSchema,
      prompt: `Analyze the following note.

Note title: ${JSON.stringify(title || "(untitled)")}
Note content: ${JSON.stringify(snippet || "(empty)")}`,
      temperature: 0.3,
      abortSignal: AbortSignal.timeout(8000),
    });
    return object;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new AppError("AI service timed out. Please try again.", 504);
    }
    const status = (err as { status?: number }).status;
    if (status === 429) throw new AppError("AI rate limit reached. Please wait a moment and try again.", 429);
    if (status === 401 || status === 403) throw new AppError("AI service access denied. Check MISTRAL_API_KEY in .env.", 403);
    throw new AppError("AI generation failed. Please try again.", 500);
  }
}
