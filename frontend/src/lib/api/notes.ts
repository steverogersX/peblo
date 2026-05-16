import type { Note } from "@/lib/schemas/note";
import type { ShareLinkPermission } from "@peblo/shared";
import { request } from "./client";

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
  shareLinkPermission?: ShareLinkPermission;
};

export type PublicNote = Omit<Note, "shareToken"> & { ownerName: string };

export type NotePageResult = {
  notes: Note[];
  nextCursor: string | null;
  hasMore: boolean;
};

export const notesApi = {
  list: (params?: { cursor?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.cursor) qs.set("cursor", params.cursor);
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return request<NotePageResult>(`/api/notes${query ? `?${query}` : ""}`);
  },

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

  summarize: (id: string) =>
    request<{ note: Note; suggestedTitle: string }>(`/api/notes/${id}/summarize`, { method: "POST" }),

  getPublic: (token: string) =>
    request<PublicNote>(`/api/public/notes/${token}`),

  updatePublic: (token: string, body: { title?: string; content?: string }) =>
    request<PublicNote>(`/api/public/notes/${token}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};
