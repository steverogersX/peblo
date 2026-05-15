"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Note, UpdateNote } from "@/lib/schemas/note";
import { MOCK_NOTES } from "@/lib/mock-notes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SaveStatus = "saved" | "saving" | "unsaved";
export type SortBy = "updatedAt" | "createdAt" | "title";

interface NotesState {
  notes: Note[];
  selectedId: string | null;
  search: string;
  filterTags: string[];
  sortBy: SortBy;
  loadStatus: "idle" | "loading" | "success" | "error";
  saveStatus: SaveStatus;
}

type NotesAction =
  | { type: "LOAD_SUCCESS"; payload: Note[] }
  | { type: "SELECT"; payload: string | null }
  | { type: "CREATE"; payload: Note }
  | { type: "UPDATE"; payload: { id: string; changes: UpdateNote } }
  | { type: "DELETE"; payload: string }
  | { type: "TOGGLE_ARCHIVE"; payload: string }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "TOGGLE_FILTER_TAG"; payload: string }
  | { type: "SET_SORT"; payload: SortBy }
  | { type: "SET_SAVE_STATUS"; payload: SaveStatus };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const initialState: NotesState = {
  notes: [],
  selectedId: null,
  search: "",
  filterTags: [],
  sortBy: "updatedAt",
  loadStatus: "idle",
  saveStatus: "saved",
};

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return { ...state, loadStatus: "success", notes: action.payload };

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

    case "DELETE":
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.payload),
        selectedId:
          state.selectedId === action.payload ? null : state.selectedId,
      };

    case "TOGGLE_ARCHIVE":
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload ? { ...n, isArchived: !n.isArchived } : n
        ),
        selectedId:
          state.selectedId === action.payload ? null : state.selectedId,
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

    case "SET_SORT":
      return { ...state, sortBy: action.payload };

    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.payload };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Derived selectors
// ---------------------------------------------------------------------------

function selectFilteredNotes(state: NotesState): Note[] {
  let notes = state.notes.filter((n) => !n.isArchived);

  if (state.search.trim()) {
    const q = state.search.toLowerCase();
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (state.filterTags.length > 0) {
    notes = notes.filter((n) =>
      state.filterTags.every((t) => n.tags.includes(t))
    );
  }

  return [...notes].sort((a, b) => {
    if (state.sortBy === "title") return a.title.localeCompare(b.title);
    return (
      new Date(b[state.sortBy]).getTime() - new Date(a[state.sortBy]).getTime()
    );
  });
}

function selectAllTags(notes: Note[]): string[] {
  return [...new Set(notes.flatMap((n) => n.tags))].sort();
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface NotesContextValue extends NotesState {
  filteredNotes: Note[];
  allTags: string[];
  selectedNote: Note | null;
  createNote: () => void;
  updateNote: (id: string, changes: UpdateNote) => void;
  deleteNote: (id: string) => void;
  toggleArchive: (id: string) => void;
  selectNote: (id: string | null) => void;
  setSearch: (q: string) => void;
  toggleFilterTag: (tag: string) => void;
  setSortBy: (sort: SortBy) => void;
  setSaveStatus: (s: SaveStatus) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function NotesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  useEffect(() => {
    // Simulate fetch — replace with real API call
    const timer = setTimeout(() => {
      dispatch({ type: "LOAD_SUCCESS", payload: MOCK_NOTES });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const createNote = useCallback(() => {
    const now = new Date().toISOString();
    const note: Note = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      tags: [],
      visibility: "private",
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: "CREATE", payload: note });
  }, []);

  const updateNote = useCallback((id: string, changes: UpdateNote) => {
    dispatch({ type: "UPDATE", payload: { id, changes } });
  }, []);

  const deleteNote = useCallback((id: string) => {
    dispatch({ type: "DELETE", payload: id });
  }, []);

  const toggleArchive = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_ARCHIVE", payload: id });
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

  const setSortBy = useCallback((sort: SortBy) => {
    dispatch({ type: "SET_SORT", payload: sort });
  }, []);

  const setSaveStatus = useCallback((s: SaveStatus) => {
    dispatch({ type: "SET_SAVE_STATUS", payload: s });
  }, []);

  const filteredNotes = selectFilteredNotes(state);
  const allTags = selectAllTags(state.notes);
  const selectedNote = state.notes.find((n) => n.id === state.selectedId) ?? null;

  return (
    <NotesContext.Provider
      value={{
        ...state,
        filteredNotes,
        allTags,
        selectedNote,
        createNote,
        updateNote,
        deleteNote,
        toggleArchive,
        selectNote,
        setSearch,
        toggleFilterTag,
        setSortBy,
        setSaveStatus,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within a NotesProvider");
  return ctx;
}
