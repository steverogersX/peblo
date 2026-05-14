"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const DEFAULT_TAGS = [
  "work", "personal", "research", "ideas", "meeting",
  "learning", "product", "technical", "health", "finance",
];

export const DEFAULT_CATEGORIES = [
  "Work", "Personal", "Research", "Technical", "Product", "Ideas",
];

export type EditorFontSize = "sm" | "md" | "lg";
export type NoteListDensity = "compact" | "normal";
export type DefaultVisibility = "private" | "public";
export type DefaultSort = "updatedAt" | "createdAt" | "title";

export interface AppSettings {
  tags: string[];
  categories: string[];
  defaultVisibility: DefaultVisibility;
  defaultSort: DefaultSort;
  editorSpellCheck: boolean;
  editorFontSize: EditorFontSize;
  showWordCount: boolean;
  noteListDensity: NoteListDensity;
}

export const DEFAULT_SETTINGS: AppSettings = {
  tags: DEFAULT_TAGS,
  categories: DEFAULT_CATEGORIES,
  defaultVisibility: "private",
  defaultSort: "updatedAt",
  editorSpellCheck: false,
  editorFontSize: "md",
  showWordCount: false,
  noteListDensity: "normal",
};

const STORAGE_KEY = "peblo:settings";

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  addCategory: (cat: string) => void;
  removeCategory: (cat: string) => void;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const addTag = useCallback((tag: string) => {
    const normalized = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (!normalized) return;
    setSettings((s) =>
      s.tags.includes(normalized) ? s : { ...s, tags: [...s.tags, normalized] }
    );
  }, []);

  const removeTag = useCallback((tag: string) => {
    setSettings((s) => ({ ...s, tags: s.tags.filter((t) => t !== tag) }));
  }, []);

  const addCategory = useCallback((cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    setSettings((s) =>
      s.categories.includes(trimmed)
        ? s
        : { ...s, categories: [...s.categories, trimmed] }
    );
  }, []);

  const removeCategory = useCallback((cat: string) => {
    setSettings((s) => ({
      ...s,
      categories: s.categories.filter((c) => c !== cat),
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        addTag,
        removeTag,
        addCategory,
        removeCategory,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
