"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import type { Note, UpdateNote } from "@/lib/schemas/note";
import { notesApi } from "@/lib/api/notes";
import { useAuth } from "@/contexts/AuthContext";

export type SaveStatus = "saved" | "saving" | "unsaved";
export type SortBy = "updatedAt" | "createdAt" | "title";

interface NotesState {
  notes: Note[];
  selectedId: string | null;
  search: string;
  filterTags: string[];
  filterCategories: string[];
  sortBy: SortBy;
  loadStatus: "idle" | "loading" | "success" | "error";
  saveStatus: SaveStatus;
  cursor: string | null;
  hasMore: boolean;
  isFetchingMore: boolean;
}

type NotesAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: { notes: Note[]; nextCursor: string | null; hasMore: boolean } }
  | { type: "LOAD_ERROR" }
  | { type: "LOAD_MORE_START" }
  | { type: "LOAD_MORE_SUCCESS"; payload: { notes: Note[]; nextCursor: string | null; hasMore: boolean } }
  | { type: "SELECT"; payload: string | null }
  | { type: "CREATE"; payload: Note }
  | { type: "UPDATE"; payload: { id: string; changes: UpdateNote } }
  | { type: "PATCH"; payload: { id: string; patch: Partial<Note> } }
  | { type: "DELETE"; payload: string }
  | { type: "TOGGLE_ARCHIVE"; payload: string }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "TOGGLE_FILTER_TAG"; payload: string }
  | { type: "TOGGLE_FILTER_CATEGORY"; payload: string }
  | { type: "SET_SORT"; payload: SortBy }
  | { type: "SET_SAVE_STATUS"; payload: SaveStatus };

const initialState: NotesState = {
  notes: [],
  selectedId: null,
  search: "",
  filterTags: [],
  filterCategories: [],
  sortBy: "updatedAt",
  loadStatus: "loading",
  saveStatus: "saved",
  cursor: null,
  hasMore: false,
  isFetchingMore: false,
};

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loadStatus: "loading" };

    case "LOAD_SUCCESS":
      return {
        ...state,
        loadStatus: "success",
        notes: action.payload.notes,
        cursor: action.payload.nextCursor,
        hasMore: action.payload.hasMore,
        isFetchingMore: false,
      };

    case "LOAD_ERROR":
      return { ...state, loadStatus: "error" };

    case "LOAD_MORE_START":
      return { ...state, isFetchingMore: true };

    case "LOAD_MORE_SUCCESS":
      return {
        ...state,
        isFetchingMore: false,
        notes: [...state.notes, ...action.payload.notes],
        cursor: action.payload.nextCursor,
        hasMore: action.payload.hasMore,
      };

    case "SELECT":
      return { ...state, selectedId: action.payload };

    case "CREATE":
      return {
        ...state,
        notes: [action.payload, ...state.notes],
        selectedId: action.payload.id,
        saveStatus: "saved",
      };

    case "UPDATE": {
      const now = new Date().toISOString();
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload.id
            ? { ...n, ...action.payload.changes, updatedAt: now }
            : n
        ),
      };
    }

    case "PATCH":
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload.id ? { ...n, ...action.payload.patch } : n
        ),
      };

    case "DELETE":
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.payload),
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
      };

    case "TOGGLE_ARCHIVE":
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload ? { ...n, isArchived: !n.isArchived } : n
        ),
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
      };

    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "TOGGLE_FILTER_TAG":
      return {
        ...state,
        filterTags: state.filterTags.includes(action.payload)
          ? state.filterTags.filter((t) => t !== action.payload)
          : [...state.filterTags, action.payload],
      };

    case "TOGGLE_FILTER_CATEGORY":
      return {
        ...state,
        filterCategories: state.filterCategories.includes(action.payload)
          ? state.filterCategories.filter((c) => c !== action.payload)
          : [...state.filterCategories, action.payload],
      };

    case "SET_SORT":
      return { ...state, sortBy: action.payload };

    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.payload };

    default:
      return state;
  }
}

function selectFilteredNotes(state: NotesState): Note[] {
  let list = state.notes.filter((n) => !n.isArchived);

  if (state.search.trim()) {
    const q = state.search.toLowerCase();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (state.filterTags.length > 0) {
    list = list.filter((n) => state.filterTags.every((t) => n.tags.includes(t)));
  }

  if (state.filterCategories.length > 0) {
    list = list.filter(
      (n) => n.category != null && state.filterCategories.includes(n.category)
    );
  }

  return [...list].sort((a, b) => {
    if (state.sortBy === "title") return a.title.localeCompare(b.title);
    return new Date(b[state.sortBy]).getTime() - new Date(a[state.sortBy]).getTime();
  });
}

function selectAllTags(notes: Note[]): string[] {
  return [...new Set(notes.flatMap((n) => n.tags))].sort();
}

function selectAllCategories(notes: Note[]): string[] {
  return [
    ...new Set(notes.map((n) => n.category).filter((c): c is string => c != null)),
  ].sort();
}

interface NotesContextValue extends NotesState {
  filteredNotes: Note[];
  allTags: string[];
  allCategories: string[];
  selectedNote: Note | null;
  createNote: (opts?: { visibility?: "private" | "public" }) => string;
  updateNote: (id: string, changes: UpdateNote) => void;
  patchNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleArchive: (id: string) => void;
  selectNote: (id: string | null) => void;
  setSearch: (q: string) => void;
  toggleFilterTag: (tag: string) => void;
  toggleFilterCategory: (category: string) => void;
  setSortBy: (sort: SortBy) => void;
  setSaveStatus: (s: SaveStatus) => void;
  loadMore: () => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(notesReducer, initialState);
  const stateRef = useRef(state);
  useLayoutEffect(() => { stateRef.current = state; });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      dispatch({ type: "LOAD_SUCCESS", payload: { notes: [], nextCursor: null, hasMore: false } });
      return;
    }
    dispatch({ type: "LOAD_START" });
    notesApi
      .list()
      .then((result) => dispatch({ type: "LOAD_SUCCESS", payload: result }))
      .catch((err) => {
        console.error("Failed to load notes:", err);
        dispatch({ type: "LOAD_ERROR" });
      });
  }, [user?.id, authLoading]);

  const loadMore = useCallback(() => {
    const { cursor, hasMore, isFetchingMore } = stateRef.current;
    if (!hasMore || isFetchingMore || !cursor) return;
    dispatch({ type: "LOAD_MORE_START" });
    notesApi
      .list({ cursor })
      .then((result) => dispatch({ type: "LOAD_MORE_SUCCESS", payload: result }))
      .catch((err) => {
        console.error("Failed to load more notes:", err);
        dispatch({ type: "LOAD_MORE_SUCCESS", payload: { notes: [], nextCursor: stateRef.current.cursor, hasMore: stateRef.current.hasMore } });
      });
  }, []);

  const createNote = useCallback((opts?: { visibility?: "private" | "public" }): string => {
    const now = new Date().toISOString();
    const note: Note = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      tags: [],
      visibility: opts?.visibility ?? "private",
      isArchived: false,
      shareLinkPermission: "none",
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: "CREATE", payload: note });
    notesApi
      .create({ id: note.id, title: note.title, content: note.content, tags: note.tags, visibility: note.visibility })
      .catch((err) => console.error("Failed to create note:", err));
    return note.id;
  }, []);

  const updateNote = useCallback((id: string, changes: UpdateNote) => {
    dispatch({ type: "UPDATE", payload: { id, changes } });
    notesApi
      .update(id, changes)
      .then((updated) => dispatch({ type: "PATCH", payload: { id, patch: updated } }))
      .catch((err) => console.error("Failed to update note:", err));
  }, []);

  const patchNote = useCallback((id: string, patch: Partial<Note>) => {
    dispatch({ type: "PATCH", payload: { id, patch } });
  }, []);

  const deleteNote = useCallback((id: string) => {
    dispatch({ type: "DELETE", payload: id });
    notesApi.remove(id).catch((err) => console.error("Failed to delete note:", err));
  }, []);

  const toggleArchive = useCallback((id: string) => {
    const note = stateRef.current.notes.find((n) => n.id === id);
    dispatch({ type: "TOGGLE_ARCHIVE", payload: id });
    if (note) {
      notesApi
        .update(id, { isArchived: !note.isArchived })
        .catch((err) => console.error("Failed to archive note:", err));
    }
  }, []);

  const selectNote = useCallback((id: string | null) => {
    dispatch({ type: "SELECT", payload: id });
  }, []);

  const setSearch = useCallback((q: string) => {
    dispatch({ type: "SET_SEARCH", payload: q });
  }, []);

  const toggleFilterTag = useCallback((tag: string) => {
    dispatch({ type: "TOGGLE_FILTER_TAG", payload: tag });
  }, []);

  const toggleFilterCategory = useCallback((category: string) => {
    dispatch({ type: "TOGGLE_FILTER_CATEGORY", payload: category });
  }, []);

  const setSortBy = useCallback((sort: SortBy) => {
    dispatch({ type: "SET_SORT", payload: sort });
  }, []);

  const setSaveStatus = useCallback((s: SaveStatus) => {
    dispatch({ type: "SET_SAVE_STATUS", payload: s });
  }, []);

  const filteredNotes = selectFilteredNotes(state);
  const allTags = selectAllTags(state.notes);
  const allCategories = selectAllCategories(state.notes);
  const selectedNote = state.notes.find((n) => n.id === state.selectedId) ?? null;

  return (
    <NotesContext.Provider
      value={{
        ...state,
        filteredNotes,
        allTags,
        allCategories,
        selectedNote,
        createNote,
        updateNote,
        patchNote,
        deleteNote,
        toggleArchive,
        selectNote,
        setSearch,
        toggleFilterTag,
        toggleFilterCategory,
        setSortBy,
        setSaveStatus,
        loadMore,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within a NotesProvider");
  return ctx;
}
