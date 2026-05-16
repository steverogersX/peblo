"use client";

import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import {
  Tag, SlidersHorizontal, PenLine, Palette,
  Plus, X, RotateCcw, User, Sun, Moon, ChevronDown, Check,
  LogOut,
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
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type Section = "appearance" | "tags-categories" | "defaults" | "editor" | "account";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "appearance",      label: "Appearance",        icon: Palette },
  { id: "tags-categories", label: "Tags & Categories",  icon: Tag },
  { id: "defaults",        label: "Note Defaults",      icon: SlidersHorizontal },
  { id: "editor",          label: "Editor",             icon: PenLine },
  { id: "account",         label: "Account",            icon: User },
];

/* ── helpers ─────────────────────────────────────────────────────────── */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ── Primitives ─────────────────────────────────────────────────────── */

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-[18px] font-semibold tracking-tight text-foreground">{title}</h2>
      {description && (
        <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function RowGroup({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="mb-6">
      {label && (
        <p className="mb-2 px-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </p>
      )}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/50">
        {children}
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
  noDivider,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  noDivider?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-6 px-5 py-3.5">
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-foreground">{label}</p>
          {description && (
            <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
      {!noDivider && <Separator />}
    </>
  );
}

function InfoRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-3.5 text-[13px] text-muted-foreground">
      {children}
    </div>
  );
}

/* ── Toggle ─────────────────────────────────────────────────────────── */

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
        checked ? "bg-blue" : "bg-muted-foreground/25"
      )}
    >
      <span
        className={cn(
          "absolute size-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
          "transition-transform duration-200",
          checked ? "translate-x-[20px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}

/* ── Segmented control ───────────────────────────────────────────────── */

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
    <div className="flex rounded-lg bg-accent/60 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1 text-[12.5px] font-medium transition-all duration-150",
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
      className="absolute right-0 top-full z-50 mt-1.5 w-40 rounded-xl border border-border bg-popover py-1.5 shadow-lg"
    >
      {TAG_COLOR_NAMES.map((name, i) => (
        <button
          key={i}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onSelect(i); }}
          className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[12.5px] transition-colors hover:bg-accent"
        >
          <span
            className="size-3 shrink-0 rounded-sm"
            style={{ backgroundColor: `var(--tag-${i}-bg)`, border: `1px solid var(--tag-${i}-text)` }}
          />
          <span className="flex-1 text-left text-foreground/80">{name}</span>
          {i === currentIndex && (
            <Check className="size-3 shrink-0 text-blue" strokeWidth={2.5} />
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
    <div className="group relative flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/40">
      <span
        className="inline-flex min-w-0 max-w-[160px] shrink-0 items-center rounded-md px-2 py-0.5 text-[12px] font-medium"
        style={tagStyle}
      >
        <span className="truncate">{label}</span>
      </span>

      <div className="flex flex-1 items-center justify-end gap-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <span className="size-2.5 shrink-0 rounded-sm" style={getTagStyleByIndex(colorIdx)} />
            <span>{TAG_COLOR_NAMES[colorIdx]}</span>
            <ChevronDown className="size-3 opacity-50" strokeWidth={2} />
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
          className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
          aria-label={`Remove ${label}`}
        >
          <X className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* ── Chip ────────────────────────────────────────────────────────────── */

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1 text-[12.5px] font-medium text-foreground/80">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="opacity-40 transition-opacity hover:opacity-100"
        aria-label={`Remove ${label}`}
      >
        <X className="size-3" strokeWidth={2.5} />
      </button>
    </span>
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
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 transition-colors focus-within:border-blue/60 hover:border-border-strong">
      <Plus className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        onBlur={commit}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/60"
      />
    </div>
  );
}

/* ── Sections ─────────────────────────────────────────────────────────── */

function AppearanceSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <>
      <SectionHeading title="Appearance" description="Choose how Peblo looks and feels." />

      <RowGroup label="Theme">
        <div className="grid grid-cols-2 gap-3 p-4">
          {(["light", "dark"] as Theme[]).map((t) => {
            const active = settings.theme === t;
            return (
              <button
                key={t}
                onClick={() => updateSettings({ theme: t })}
                className={cn(
                  "relative flex flex-col items-start gap-4 rounded-xl border p-4 text-left transition-all duration-150",
                  active
                    ? "border-blue/50 bg-blue/5 shadow-[0_0_0_1px_rgba(80,142,255,0.2)]"
                    : "border-border/60 hover:border-border hover:bg-accent/40"
                )}
              >
                {active && (
                  <span className="absolute right-3 top-3 flex size-4 items-center justify-center rounded-full bg-blue">
                    <Check className="size-2.5 text-white" strokeWidth={3} />
                  </span>
                )}

                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg border",
                    t === "dark"
                      ? "border-border bg-[#1a1a1a]"
                      : "border-border bg-[#f5f5f5]"
                  )}
                >
                  {t === "dark"
                    ? <Moon className="size-4.5 text-blue" strokeWidth={1.5} />
                    : <Sun className="size-4.5 text-amber-400" strokeWidth={1.5} />
                  }
                </div>

                <div>
                  <p className={cn(
                    "text-[13px] font-semibold capitalize",
                    active ? "text-blue" : "text-foreground"
                  )}>
                    {t === "dark" ? "Dark" : "Light"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {t === "dark" ? "Easy on the eyes" : "Clean & bright"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </RowGroup>
    </>
  );
}

function TagsCategoriesSection() {
  const { settings, addTag, removeTag, addCategory, removeCategory, resetToDefaults } = useSettings();

  const tagsAreDefault =
    JSON.stringify([...settings.tags].sort()) === JSON.stringify([...DEFAULT_TAGS].sort());

  return (
    <>
      <SectionHeading
        title="Tags & Categories"
        description="Manage the tags and categories available in the note editor."
      />

      <RowGroup label="Tags">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <p className="text-[12.5px] text-muted-foreground">
            {settings.tags.length} tag{settings.tags.length !== 1 ? "s" : ""} · shown as suggestions
          </p>
          {!tagsAreDefault && (
            <button
              onClick={() => DEFAULT_TAGS.forEach((t) => addTag(t))}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <RotateCcw className="size-3" strokeWidth={1.5} />
              Restore
            </button>
          )}
        </div>

        {settings.tags.length > 0 ? (
          <div className="border-b border-border/60">
            {settings.tags.map((tag) => (
              <TagRow key={tag} label={tag} onRemove={() => removeTag(tag)} />
            ))}
          </div>
        ) : (
          <InfoRow>No tags yet.</InfoRow>
        )}

        <div className="px-4 py-3">
          <AddItemInput
            placeholder="New tag — press Enter to add"
            onAdd={addTag}
            normalize={(v) => v.trim().toLowerCase().replace(/\s+/g, "-")}
          />
        </div>
      </RowGroup>

      <RowGroup label="Categories">
        <div className="border-b border-border/60 px-4 py-3">
          <p className="text-[12.5px] text-muted-foreground">
            {settings.categories.length} categor{settings.categories.length !== 1 ? "ies" : "y"} · shown in the category picker
          </p>
        </div>

        <div className="px-4 py-4">
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
            placeholder="New category — press Enter to add"
            onAdd={addCategory}
            normalize={(v) => v.trim()}
          />
        </div>
      </RowGroup>

      <div className="flex justify-end">
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground/70 transition-colors hover:text-muted-foreground"
        >
          <RotateCcw className="size-3" strokeWidth={1.5} />
          Reset all to defaults
        </button>
      </div>
    </>
  );
}

const SORT_OPTIONS: { value: DefaultSort; label: string; description: string }[] = [
  { value: "updatedAt", label: "Last edited",  description: "Most recently changed first" },
  { value: "createdAt", label: "Date created", description: "Newest notes first" },
  { value: "title",     label: "Title A–Z",    description: "Alphabetical order" },
];

function DefaultsSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <>
      <SectionHeading
        title="Note Defaults"
        description="Default settings applied whenever you create a new note."
      />

      <RowGroup label="New Note">
        <SettingRow label="Visibility" description="Who can see new notes by default">
          <SegmentedControl<DefaultVisibility>
            options={[
              { value: "private", label: "Private" },
              { value: "public",  label: "Public" },
            ]}
            value={settings.defaultVisibility}
            onChange={(v) => updateSettings({ defaultVisibility: v })}
          />
        </SettingRow>

        <div className="px-5 py-3.5">
          <p className="mb-3 text-[13.5px] font-medium text-foreground">Sort order</p>
          <div className="flex flex-col gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateSettings({ defaultSort: opt.value })}
                className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent/60"
              >
                <span className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
                  settings.defaultSort === opt.value ? "border-blue" : "border-muted-foreground/40"
                )}>
                  {settings.defaultSort === opt.value && (
                    <span className="size-1.5 rounded-full bg-blue" />
                  )}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{opt.label}</p>
                  <p className="text-[12px] text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </RowGroup>
    </>
  );
}

function EditorSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <>
      <SectionHeading
        title="Editor"
        description="Customise the writing experience."
      />

      <RowGroup label="Writing">
        <SettingRow label="Spell check" description="Underline misspelled words">
          <Toggle checked={settings.editorSpellCheck} onChange={(v) => updateSettings({ editorSpellCheck: v })} />
        </SettingRow>
        <SettingRow label="Word count" description="Show count at the bottom of the editor" noDivider>
          <Toggle checked={settings.showWordCount} onChange={(v) => updateSettings({ showWordCount: v })} />
        </SettingRow>
      </RowGroup>

      <RowGroup label="Display">
        <SettingRow label="Font size" description="Body text size inside the editor">
          <SegmentedControl<EditorFontSize>
            options={[
              { value: "sm", label: "S" },
              { value: "md", label: "M" },
              { value: "lg", label: "L" },
            ]}
            value={settings.editorFontSize}
            onChange={(v) => updateSettings({ editorFontSize: v })}
          />
        </SettingRow>
        <SettingRow label="Note list density" description="Vertical spacing in the note list" noDivider>
          <SegmentedControl<NoteListDensity>
            options={[
              { value: "compact", label: "Compact" },
              { value: "normal",  label: "Normal" },
            ]}
            value={settings.noteListDensity}
            onChange={(v) => updateSettings({ noteListDensity: v })}
          />
        </SettingRow>
      </RowGroup>

      <RowGroup label="Autosave">
        <InfoRow>
          Notes save automatically 700 ms after you stop typing. Not yet configurable.
        </InfoRow>
      </RowGroup>
    </>
  );
}

function AccountSection() {
  const { user, logout } = useAuth();

  const displayName = user?.name ?? "—";
  const email = user?.email ?? "—";
  const initials = user ? getInitials(user.name) : "?";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <>
      <SectionHeading title="Account" description="Your profile details." />

      {/* Profile card */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border/60 bg-card/50">
        <div className="flex items-center gap-4 px-5 py-5">
          <Avatar size="lg" className="size-12 ring-2 ring-border">
            <AvatarFallback className="bg-gradient-to-br from-blue/30 to-blue/10 text-[15px] font-semibold text-blue">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-[13px] text-muted-foreground">{email}</p>
            {memberSince && (
              <p className="mt-0.5 text-[12px] text-muted-foreground/60">
                Member since {memberSince}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Danger zone */}
      <RowGroup label="Danger Zone">
        <div className="px-5 py-4">
          <p className="mb-1 text-[13.5px] font-medium text-foreground">Sign out</p>
          <p className="mb-3 text-[12.5px] text-muted-foreground">
            Sign out of your account on this device.
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-border/60 px-3.5 py-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-3.5" strokeWidth={1.5} />
            Sign out
          </button>
        </div>

        <Separator />

        <div className="px-5 py-4">
          <p className="mb-1 text-[13.5px] font-medium text-destructive">Delete account</p>
          <p className="mb-3 text-[12.5px] text-muted-foreground">
            Permanently delete your account and all its data. This cannot be undone.
          </p>
          <button className="rounded-lg border border-destructive/30 px-3.5 py-1.5 text-[12.5px] font-medium text-destructive transition-colors hover:bg-destructive/8">
            Delete account
          </button>
        </div>
      </RowGroup>
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("appearance");
  const { user } = useAuth();

  const content: Record<Section, React.ReactNode> = {
    appearance:        <AppearanceSection />,
    "tags-categories": <TagsCategoriesSection />,
    defaults:          <DefaultsSection />,
    editor:            <EditorSection />,
    account:           <AccountSection />,
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">

      {/* ── Left nav ──────────────────────────────────────────────────── */}
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-border/60 bg-sidebar">
        <div className="flex h-[52px] items-center border-b border-sidebar-border/60 px-5">
          <span className="text-[13.5px] font-semibold text-foreground">Settings</span>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto px-2.5 py-3 gap-0.5">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("size-4 shrink-0 transition-colors", isActive ? "text-foreground" : "text-muted-foreground/70")}
                  strokeWidth={isActive ? 2 : 1.75}
                />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-[640px] px-10 py-10">
          {content[active]}
        </div>
      </ScrollArea>
    </div>
  );
}
