"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { hashTagIndex, getTagStyleByIndex } from "@/lib/tag-colors";

type TagColorMap = Record<string, number>;

interface TagColorContextValue {
  getTagStyle: (tag: string) => { backgroundColor: string; color: string };
  getTagColorIndex: (tag: string) => number;
  setTagColor: (tag: string, colorIndex: number) => void;
}

const TagColorContext = createContext<TagColorContextValue | null>(null);

const STORAGE_KEY = "peblo-tag-colors";

export function TagColorProvider({ children }: { children: ReactNode }) {
  const [colorMap, setColorMap] = useState<TagColorMap>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setColorMap(JSON.parse(stored));
    } catch {}
  }, []);

  const setTagColor = useCallback((tag: string, colorIndex: number) => {
    setColorMap((prev) => {
      const next = { ...prev, [tag]: colorIndex };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const getTagColorIndex = useCallback(
    (tag: string) => colorMap[tag] ?? hashTagIndex(tag),
    [colorMap]
  );

  const getTagStyle = useCallback(
    (tag: string) => getTagStyleByIndex(getTagColorIndex(tag)),
    [getTagColorIndex]
  );

  return (
    <TagColorContext.Provider value={{ getTagStyle, getTagColorIndex, setTagColor }}>
      {children}
    </TagColorContext.Provider>
  );
}

export function useTagColors() {
  const ctx = useContext(TagColorContext);
  if (!ctx) throw new Error("useTagColors must be used within TagColorProvider");
  return ctx;
}
