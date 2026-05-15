"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { getTagStyle } from "@/lib/tag-colors";

interface TagInputProps {
  tags: string[];
  suggestions?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  tags,
  suggestions = [],
  onChange,
  placeholder = "Add tag…",
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) => !tags.includes(s) && s.includes(input.toLowerCase())
  );
  const showDropdown = open && filteredSuggestions.length > 0;

  function commit(value?: string) {
    const raw = (value ?? input).trim().toLowerCase().replace(/\s+/g, "-");
    if (raw && !tags.includes(raw)) {
      onChange([...tags, raw]);
    }
    setInput("");
    setOpen(false);
    setHighlighted(0);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (showDropdown) {
      if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filteredSuggestions.length - 1)); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); return; }
      if (e.key === "Enter")     { e.preventDefault(); commit(filteredSuggestions[highlighted]); return; }
      if (e.key === "Escape")    { setOpen(false); return; }
    }
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); }
    if (e.key === "Backspace" && !input && tags.length > 0) onChange(tags.slice(0, -1));
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex min-h-[28px] flex-wrap items-center gap-1.5 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[12px] font-medium"
            style={getTagStyle(tag)}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(tags.filter((t) => t !== tag)); }}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="size-2.5" strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); setHighlighted(0); }}
          onKeyDown={handleKey}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="min-w-[80px] flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 top-full z-40 mt-1 w-48 rounded-lg border border-border bg-popover py-1 shadow-lg">
          {filteredSuggestions.map((s, i) => (
            <button
              key={s}
              onMouseDown={(e) => { e.preventDefault(); commit(s); }}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-[13px] ${
                i === highlighted ? "bg-accent" : "hover:bg-accent"
              }`}
            >
              <span
                className="inline-block rounded px-1.5 py-px text-[11px] font-medium"
                style={getTagStyle(s)}
              >
                {s}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
