"use client";

import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import {
  Tag, SlidersHorizontal, PenLine, Palette,
  Plus, X, RotateCcw, User, Sun, Moon, ChevronDown, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTagColors } from "@/contexts/TagColorContext";
import { TAG_COLOR_NAMES, getTagStyleByIndex } from "@/lib/tag-colors";
import {
  useSettings,
  DEFAULT_TAGS,
  DEFAULT_CATEGORIES,
  type EditorFontSize,
  type NoteListDensity,
  type DefaultVisibility,
  type DefaultSort,
  type Theme,
} from "@/contexts/SettingsContext";
import { ScrollArea } from "@/components/ui/scroll-area";

type Section = "appearance" | "tags-categories" | "defaults" | "editor" | "account";

const SECTIONS: { id: Section; label: string; icon: React.ElementType; description: string }[] = [
  { id: "appearance",      label: "Appearance",       icon: Palette,          description: "Theme and visual preferences." },
  { id: "tags-categories", label: "Tags & Categories", icon: Tag,              description: "Manage tags and categories available in the editor." },
  { id: "defaults",        label: "Note defaults",     icon: SlidersHorizontal, description: "Default settings applied to every new note." },
  { id: "editor",          label: "Editor",            icon: PenLine,          description: "Customise the writing experience." },
  { id: "account",         label: "Account",           icon: User,             description: "Your profile and plan." },
];

/* ── Primitives ─────────────────────────────────────────────────────── */

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-[20px] font-bold tracking-[-0.02em] text-foreground">{title}</h2>
      <p className="mt-1 text-[14px] text-muted-foreground">{description}</p>
    </div>
  );
}

function SettingCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      {children}
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
  last,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-8 px-5 py-4", !last && "border-b border-border")}>
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
        "transition-colors duration-200",
        checked ? "bg-blue" : "bg-border-strong"
      )}
    >
      <span
        className={cn(
          "absolute h-3.5 w-3.5 rounded-full bg-white shadow-sm",
          "transition-transform duration-200",
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-md bg-accent p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded px-3 py-1 text-[13px] font-medium transition-all duration-150",
            value === opt.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Plain chip (categories) ─────────────────────────────────────────── */

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-[13px] font-medium text-foreground/80">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="opacity-50 hover:opacity-100 transition-opacity"
        aria-label={`Remove ${label}`}
      >
        <X className="size-3" strokeWidth={2} />
      </button>
    </span>
  );
}

/* ── Tag color dropdown ──────────────────────────────────────────────── */

function TagColorDropdown({
  currentIndex,
  onSelect,
  onClose,
}: {
  currentIndex: number;
  onSelect: (idx: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-border bg-popover py-1 shadow-md"
    >
      {TAG_COLOR_NAMES.map((name, i) => (
        <button
          key={i}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onSelect(i); }}
          className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] transition-colors hover:bg-accent"
        >
          <span
            className="size-3 shrink-0 rounded-sm"
            style={{ backgroundColor: `var(--tag-${i}-bg)`, border: `1px solid var(--tag-${i}-text)` }}
          />
          <span className="flex-1 text-left text-foreground/80">{name}</span>
          {i === currentIndex && (
            <Check className="size-3 shrink-0 text-foreground/60" strokeWidth={2.5} />
          )}
        </button>
      ))}
    </div>
  );
}

/* ── Tag row ─────────────────────────────────────────────────────────── */

function TagRow({ label, onRemove }: { label: string; onRemove: () => void }) {
  const { getTagStyle, getTagColorIndex, setTagColor } = useTagColors();
  const [open, setOpen] = useState(false);
  const colorIdx = getTagColorIndex(label);
  const tagStyle = getTagStyle(label);

  return (
    <div className="group relative flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50">
      <span
        className="inline-flex min-w-0 max-w-[160px] shrink-0 items-center rounded px-2 py-0.5 text-[12px] font-medium"
        style={tagStyle}
      >
        <span className="truncate">{label}</span>
      </span>

      <div className="flex flex-1 items-center justify-end gap-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={getTagStyleByIndex(colorIdx)}
            />
            <span>{TAG_COLOR_NAMES[colorIdx]}</span>
            <ChevronDown className="size-3 opacity-60" strokeWidth={2} />
          </button>

          {open && (
            <TagColorDropdown
              currentIndex={colorIdx}
              onSelect={(idx) => { setTagColor(label, idx); setOpen(false); }}
              onClose={() => setOpen(false)}
            />
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
          aria-label={`Remove ${label}`}
        >
          <X className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* ── Add-item input ──────────────────────────────────────────────────── */

function AddItemInput({
  placeholder,
  onAdd,
  normalize,
}: {
  placeholder: string;
  onAdd: (val: string) => void;
  normalize?: (val: string) => string;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    const v = normalize ? normalize(value) : value.trim();
    if (!v) return;
    onAdd(v);
    setValue("");
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { setValue(""); inputRef.current?.blur(); }
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-border-strong px-3 py-2 transition-colors focus-within:border-blue hover:border-dim">
      <Plus className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        onBlur={commit}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

/* ── Sections ─────────────────────────────────────────────────────────── */

function AppearanceSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <SettingCard>
        <div className="px-5 py-5">
          <p className="mb-4 text-[14px] font-medium text-foreground">Theme</p>
          <div className="grid grid-cols-2 gap-3">
            {(["light", "dark"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => updateSettings({ theme: t })}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-lg border p-5 transition-all duration-150",
                  settings.theme === t
                    ? "border-blue/40 bg-blue/5 shadow-sm"
                    : "border-border hover:border-border-strong hover:bg-accent/60"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg border",
                    t === "dark"
                      ? "border-border bg-card"
                      : "border-border bg-secondary"
                  )}
                >
                  {t === "dark"
                    ? <Moon className="size-5 text-blue" strokeWidth={1.5} />
                    : <Sun className="size-5 text-blue" strokeWidth={1.5} />
                  }
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-[13px] font-semibold capitalize",
                    settings.theme === t ? "text-blue" : "text-foreground"
                  )}>
                    {t}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {t === "dark" ? "Easy on the eyes" : "Clean & bright"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </SettingCard>
    </div>
  );
}

function TagsCategoriesSection() {
  const { settings, addTag, removeTag, addCategory, removeCategory, resetToDefaults } = useSettings();

  const tagsAreDefault =
    JSON.stringify([...settings.tags].sort()) === JSON.stringify([...DEFAULT_TAGS].sort());
  const catsAreDefault =
    JSON.stringify([...settings.categories].sort()) === JSON.stringify([...DEFAULT_CATEGORIES].sort());

  return (
    <div className="space-y-6">
      <SettingCard>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[14px] font-medium text-foreground">Tags</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {settings.tags.length} tag{settings.tags.length !== 1 ? "s" : ""} — shown as suggestions in the editor
            </p>
          </div>
          {!tagsAreDefault && (
            <button
              onClick={() => DEFAULT_TAGS.forEach((t) => addTag(t))}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <RotateCcw className="size-3" strokeWidth={1.5} />
              Restore defaults
            </button>
          )}
        </div>
        {settings.tags.length > 0 ? (
          <div className="border-b border-border">
            {settings.tags.map((tag) => (
              <TagRow key={tag} label={tag} onRemove={() => removeTag(tag)} />
            ))}
          </div>
        ) : (
          <p className="px-5 py-4 text-[13px] text-muted-foreground">No tags yet.</p>
        )}
        <div className="px-4 py-3">
          <AddItemInput
            placeholder="Type a tag and press Enter…"
            onAdd={addTag}
            normalize={(v) => v.trim().toLowerCase().replace(/\s+/g, "-")}
          />
        </div>
      </SettingCard>

      <SettingCard>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[14px] font-medium text-foreground">Categories</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {settings.categories.length} categor{settings.categories.length !== 1 ? "ies" : "y"} — shown in the category picker
            </p>
          </div>
          {!catsAreDefault && (
            <button
              onClick={() => DEFAULT_CATEGORIES.forEach((c) => addCategory(c))}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <RotateCcw className="size-3" strokeWidth={1.5} />
              Restore defaults
            </button>
          )}
        </div>
        <div className="px-5 py-4">
          {settings.categories.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {settings.categories.map((cat) => (
                <Chip key={cat} label={cat} onRemove={() => removeCategory(cat)} />
              ))}
            </div>
          ) : (
            <p className="mb-4 text-[13px] text-muted-foreground">No categories yet.</p>
          )}
          <AddItemInput
            placeholder="Type a category and press Enter…"
            onAdd={addCategory}
            normalize={(v) => v.trim()}
          />
        </div>
      </SettingCard>

      <div className="flex justify-end">
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="size-3.5" strokeWidth={1.5} />
          Reset all to defaults
        </button>
      </div>
    </div>
  );
}

const SORT_OPTIONS: { value: DefaultSort; label: string; description: string }[] = [
  { value: "updatedAt", label: "Last edited",    description: "Most recently changed notes first" },
  { value: "createdAt", label: "Date created",   description: "Newest notes first" },
  { value: "title",     label: "Title A–Z",      description: "Alphabetical order" },
];

function DefaultsSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <SettingCard>
        <SettingRow label="Default visibility" description="Applied when creating a new note">
          <SegmentedControl<DefaultVisibility>
            options={[
              { value: "private", label: "Private" },
              { value: "public",  label: "Public" },
            ]}
            value={settings.defaultVisibility}
            onChange={(v) => updateSettings({ defaultVisibility: v })}
          />
        </SettingRow>
        <SettingRow label="Default sort order" description="How notes are ordered in the list" last>
          <div className="flex flex-col gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateSettings({ defaultSort: opt.value })}
                className="flex items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent"
              >
                <span className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                  settings.defaultSort === opt.value ? "border-blue" : "border-border-strong"
                )}>
                  {settings.defaultSort === opt.value && <span className="size-1.5 rounded-full bg-blue" />}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{opt.label}</p>
                  <p className="text-[12px] text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingCard>
    </div>
  );
}

function EditorSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <SettingCard>
        <SettingRow label="Spell check" description="Underline misspelled words in the editor">
          <Toggle checked={settings.editorSpellCheck} onChange={(v) => updateSettings({ editorSpellCheck: v })} />
        </SettingRow>
        <SettingRow label="Show word count" description="Display word and character count at the bottom">
          <Toggle checked={settings.showWordCount} onChange={(v) => updateSettings({ showWordCount: v })} />
        </SettingRow>
        <SettingRow label="Font size" description="Body text size inside the editor">
          <SegmentedControl<EditorFontSize>
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Default" },
              { value: "lg", label: "Large" },
            ]}
            value={settings.editorFontSize}
            onChange={(v) => updateSettings({ editorFontSize: v })}
          />
        </SettingRow>
        <SettingRow label="Note list density" description="Vertical spacing of notes in the sidebar" last>
          <SegmentedControl<NoteListDensity>
            options={[
              { value: "compact", label: "Compact" },
              { value: "normal",  label: "Normal" },
            ]}
            value={settings.noteListDensity}
            onChange={(v) => updateSettings({ noteListDensity: v })}
          />
        </SettingRow>
      </SettingCard>

      <SettingCard>
        <div className="px-5 py-4">
          <p className="text-[14px] font-medium text-foreground">Autosave</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Notes save automatically 700 ms after you stop typing. This is not yet configurable.
          </p>
        </div>
      </SettingCard>
    </div>
  );
}

function AccountSection() {
  return (
    <div className="space-y-6">
      <SettingCard>
        <div className="flex items-center gap-4 border-b border-border px-5 py-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-strong bg-accent text-[14px] font-semibold text-subtle">
            JD
          </div>
          <div>
            <p className="text-[14px] font-semibold text-foreground">John Doe</p>
            <p className="text-[13px] text-muted-foreground">john@example.com</p>
          </div>
          <span className="ml-auto rounded-full bg-accent px-3 py-1 text-[12px] font-medium text-muted-foreground">
            Free plan
          </span>
        </div>
        <SettingRow label="Display name" description="Shown in the sidebar">
          <input
            defaultValue="John Doe"
            className="w-40 rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground outline-none transition-colors hover:border-border-strong focus:border-blue focus:ring-0"
          />
        </SettingRow>
        <SettingRow label="Email" last>
          <input
            defaultValue="john@example.com"
            className="w-52 rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground outline-none transition-colors hover:border-border-strong focus:border-blue focus:ring-0"
          />
        </SettingRow>
      </SettingCard>

      <SettingCard>
        <div className="px-5 py-5">
          <p className="text-[14px] font-semibold text-foreground">Upgrade to Pro</p>
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
            You&apos;re on the Free plan. Upgrade to unlock AI summaries, unlimited notes, and shared workspaces.
          </p>
          <button className="mt-4 rounded-md bg-blue px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90">
            Upgrade to Pro
          </button>
        </div>
      </SettingCard>

      <SettingCard>
        <div className="px-5 py-4">
          <p className="text-[14px] font-medium text-destructive">Danger zone</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Permanently delete your account and all its data. This cannot be undone.
          </p>
          <button className="mt-3 rounded-md border border-destructive/30 px-4 py-1.5 text-[13px] text-destructive transition-colors hover:bg-destructive/8">
            Delete account
          </button>
        </div>
      </SettingCard>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("appearance");
  const activeSection = SECTIONS.find((s) => s.id === active)!;

  const content: Record<Section, React.ReactNode> = {
    appearance:        <AppearanceSection />,
    "tags-categories": <TagsCategoriesSection />,
    defaults:          <DefaultsSection />,
    editor:            <EditorSection />,
    account:           <AccountSection />,
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Left nav */}
      <div className="flex w-52 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex h-[52px] items-center border-b border-sidebar-border px-5">
          <span className="text-[14px] font-semibold text-foreground">Settings</span>
        </div>
        <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-2">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 mb-px text-left text-[14px] font-medium transition-colors",
                active === id
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  active === id ? "text-foreground" : "text-muted-foreground"
                )}
                strokeWidth={1.5}
              />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl px-10 py-10">
          <SectionHeader title={activeSection.label} description={activeSection.description} />
          {content[active]}
        </div>
      </ScrollArea>
    </div>
  );
}
