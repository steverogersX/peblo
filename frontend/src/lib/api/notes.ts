import type { Note } from "@/lib/schemas/note";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Request failed");
  return json.data as T;
}

type CreatePayload = {
  id?: string;
  title?: string;
  content?: string;
  tags?: string[];
  category?: string;
  visibility?: "private" | "public";
};

type UpdatePayload = {
  title?: string;
  content?: string;
  tags?: string[];
  category?: string | null;
  visibility?: "private" | "public";
  isArchived?: boolean;
};

export const notesApi = {
  list: () =>
    request<Note[]>("/api/notes"),

  create: (body: CreatePayload) =>
    request<Note>("/api/notes", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: UpdatePayload) =>
    request<Note>(`/api/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  remove: (id: string) =>
    request<{ id: string }>(`/api/notes/${id}`, { method: "DELETE" }),
};
