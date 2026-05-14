"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  Tag, SlidersHorizontal, PenLine,
  Plus, X, RotateCcw, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSettings,
  DEFAULT_TAGS,
  DEFAULT_CATEGORIES,
  type EditorFontSize,
  type NoteListDensity,
  type DefaultVisibility,
  type DefaultSort,
} from "@/contexts/SettingsContext";
import { ScrollArea } from "@/components/ui/scroll-area";

// ---------------------------------------------------------------------------
// Section nav
// ---------------------------------------------------------------------------

type Section = "tags-categories" | "defaults" | "editor" | "account";

const SECTIONS: { id: Section; label: string; icon: React.ElementType; description: string }[] = [
  { id: "tags-categories", label: "Tags & Categories", icon: Tag, description: "Manage the tags and categories available in your notes editor." },
  { id: "defaults", label: "Note Defaults", icon: SlidersHorizontal, description: "Default settings applied to every new note." },
  { id: "editor", label: "Editor", icon: PenLine, description: "Customise the writing experience." },
  { id: "account", label: "Account", icon: User, description: "Your profile and plan." },
];

// ---------------------------------------------------------------------------
// Reusable primitives
// ---------------------------------------------------------------------------

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-[#e5e2e1]">{title}</h2>
      <p className="mt-0.5 text-[12px] text-[#8e9192]">{description}</p>
    </div>
  );
}

function SettingCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-[#2a2a2a] bg-[#1c1b1b]", className)}>
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
    <div className={cn("flex items-center justify-between gap-6 px-4 py-3.5", !last && "border-b border-[#2a2a2a]")}>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#c4c7c8]">{label}</p>
        {description && <p className="mt-0.5 text-[11px] text-[#444748]">{description}</p>}
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
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors",
        checked
          ? "border-[#508eff]/60 bg-[#508eff]/20"
          : "border-[#2a2a2a] bg-[#141313]"
      )}
    >
      <span
        className={cn(
          "absolute h-3.5 w-3.5 rounded-full transition-all",
          checked
            ? "left-[18px] bg-[#508eff]"
            : "left-[3px] bg-[#444748]"
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
    <div className="flex rounded-md border border-[#2a2a2a] bg-[#141313] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded px-3 py-1 text-[11px] font-medium transition-colors",
            value === opt.value
              ? "bg-[#2a2a2a] text-[#c4c7c8]"
              : "text-[#444748] hover:text-[#8e9192]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add-item input
// ---------------------------------------------------------------------------

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
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      setValue("");
      inputRef.current?.blur();
    }
  }

  return (
    <div className="flex items-center gap-2 rounded border border-dashed border-[#353434] bg-transparent px-2.5 py-1.5 transition-colors focus-within:border-[#508eff]/50 hover:border-[#444748]">
      <Plus className="size-3 shrink-0 text-[#444748]" strokeWidth={2} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        onBlur={commit}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[12px] text-[#8e9192] outline-none placeholder:text-[#444748]"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chip
// ---------------------------------------------------------------------------

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-[#353434] bg-[#2a2a2a] px-2 py-0.5 font-mono text-[11px] text-[#8e9192] transition-colors hover:border-[#444748]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-[#444748] transition-colors hover:text-[#c4c7c8]"
        aria-label={`Remove ${label}`}
      >
        <X className="size-2.5" strokeWidth={2} />
      </button>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section: Tags & Categories
// ---------------------------------------------------------------------------

function TagsCategoriesSection() {
  const { settings, addTag, removeTag, addCategory, removeCategory, resetToDefaults } = useSettings();

  const tagsAreDefault =
    JSON.stringify([...settings.tags].sort()) === JSON.stringify([...DEFAULT_TAGS].sort());
  const catsAreDefault =
    JSON.stringify([...settings.categories].sort()) === JSON.stringify([...DEFAULT_CATEGORIES].sort());

  return (
    <div className="space-y-6">
      {/* Tags */}
      <SettingCard>
        <div className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-3">
          <div>
            <p className="text-[13px] font-medium text-[#c4c7c8]">Tags</p>
            <p className="text-[11px] text-[#444748]">
              {settings.tags.length} tag{settings.tags.length !== 1 ? "s" : ""} — shown as autocomplete suggestions in the editor
            </p>
          </div>
          {!tagsAreDefault && (
            <button
              onClick={() => {
                DEFAULT_TAGS.forEach((t) => addTag(t));
              }}
              className="flex items-center gap-1.5 rounded border border-[#2a2a2a] px-2.5 py-1 text-[11px] text-[#444748] transition-colors hover:border-[#353434] hover:text-[#8e9192]"
            >
              <RotateCcw className="size-3" strokeWidth={1.5} />
              Restore defaults
            </button>
          )}
        </div>
        <div className="px-4 py-3">
          {settings.tags.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {settings.tags.map((tag) => (
                <Chip key={tag} label={tag} onRemove={() => removeTag(tag)} />
              ))}
            </div>
          ) : (
            <p className="mb-3 text-[11px] text-[#444748]">No tags yet.</p>
          )}
          <AddItemInput
            placeholder="Type a tag and press Enter…"
            onAdd={addTag}
            normalize={(v) => v.trim().toLowerCase().replace(/\s+/g, "-")}
          />
        </div>
      </SettingCard>

      {/* Categories */}
      <SettingCard>
        <div className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-3">
          <div>
            <p className="text-[13px] font-medium text-[#c4c7c8]">Categories</p>
            <p className="text-[11px] text-[#444748]">
              {settings.categories.length} categor{settings.categories.length !== 1 ? "ies" : "y"} — shown in the category picker in the editor
            </p>
          </div>
          {!catsAreDefault && (
            <button
              onClick={() => {
                DEFAULT_CATEGORIES.forEach((c) => addCategory(c));
              }}
              className="flex items-center gap-1.5 rounded border border-[#2a2a2a] px-2.5 py-1 text-[11px] text-[#444748] transition-colors hover:border-[#353434] hover:text-[#8e9192]"
            >
              <RotateCcw className="size-3" strokeWidth={1.5} />
              Restore defaults
            </button>
          )}
        </div>
        <div className="px-4 py-3">
          {settings.categories.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {settings.categories.map((cat) => (
                <Chip key={cat} label={cat} onRemove={() => removeCategory(cat)} />
              ))}
            </div>
          ) : (
            <p className="mb-3 text-[11px] text-[#444748]">No categories yet.</p>
          )}
          <AddItemInput
            placeholder="Type a category and press Enter…"
            onAdd={addCategory}
            normalize={(v) => v.trim()}
          />
        </div>
      </SettingCard>

      {/* Reset all */}
      <div className="flex justify-end">
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 text-[11px] text-[#444748] transition-colors hover:text-[#8e9192]"
        >
          <RotateCcw className="size-3" strokeWidth={1.5} />
          Reset all settings to defaults
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Note Defaults
// ---------------------------------------------------------------------------

const SORT_OPTIONS: { value: DefaultSort; label: string; description: string }[] = [
  { value: "updatedAt", label: "Last edited", description: "Most recently changed notes first" },
  { value: "createdAt", label: "Date created", description: "Newest notes first" },
  { value: "title", label: "Title A–Z", description: "Alphabetical order" },
];

function DefaultsSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <SettingCard>
        <SettingRow
          label="Default visibility"
          description="Applied when creating a new note"
        >
          <SegmentedControl<DefaultVisibility>
            options={[
              { value: "private", label: "Private" },
              { value: "public", label: "Public" },
            ]}
            value={settings.defaultVisibility}
            onChange={(v) => updateSettings({ defaultVisibility: v })}
          />
        </SettingRow>
        <SettingRow
          label="Default sort order"
          description="How notes are sorted in the list"
          last
        >
          <div className="flex flex-col gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateSettings({ defaultSort: opt.value })}
                className="flex items-center gap-2.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-[#2a2a2a]"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border",
                    settings.defaultSort === opt.value
                      ? "border-[#508eff] bg-[#508eff]/20"
                      : "border-[#353434]"
                  )}
                >
                  {settings.defaultSort === opt.value && (
                    <span className="size-1.5 rounded-full bg-[#508eff]" />
                  )}
                </span>
                <div>
                  <p className="text-[12px] font-medium text-[#c4c7c8]">{opt.label}</p>
                  <p className="text-[10px] text-[#444748]">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Editor
// ---------------------------------------------------------------------------

function EditorSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <SettingCard>
        <SettingRow
          label="Spell check"
          description="Underline misspelled words in the editor"
        >
          <Toggle
            checked={settings.editorSpellCheck}
            onChange={(v) => updateSettings({ editorSpellCheck: v })}
          />
        </SettingRow>
        <SettingRow
          label="Show word count"
          description="Display word and character count below the editor"
        >
          <Toggle
            checked={settings.showWordCount}
            onChange={(v) => updateSettings({ showWordCount: v })}
          />
        </SettingRow>
        <SettingRow
          label="Editor font size"
          description="Body text size inside the editor"
        >
          <SegmentedControl<EditorFontSize>
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
            ]}
            value={settings.editorFontSize}
            onChange={(v) => updateSettings({ editorFontSize: v })}
          />
        </SettingRow>
        <SettingRow
          label="Note list density"
          description="How much vertical space each note card takes"
          last
        >
          <SegmentedControl<NoteListDensity>
            options={[
              { value: "compact", label: "Compact" },
              { value: "normal", label: "Normal" },
            ]}
            value={settings.noteListDensity}
            onChange={(v) => updateSettings({ noteListDensity: v })}
          />
        </SettingRow>
      </SettingCard>

      <SettingCard>
        <div className="px-4 py-3.5">
          <p className="text-[12px] font-medium text-[#c4c7c8]">Autosave</p>
          <p className="mt-0.5 text-[11px] text-[#444748]">
            Notes are saved automatically 700 ms after you stop typing. This is not configurable yet.
          </p>
        </div>
      </SettingCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Account
// ---------------------------------------------------------------------------

function AccountSection() {
  return (
    <div className="space-y-6">
      <SettingCard>
        <div className="flex items-center gap-4 border-b border-[#2a2a2a] px-4 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#353434] bg-[#2a2a2a] text-[13px] font-semibold text-[#c4c7c8]">
            JD
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#c4c7c8]">John Doe</p>
            <p className="text-[11px] text-[#444748]">john@example.com</p>
          </div>
          <span className="ml-auto rounded-full border border-[#353434] bg-[#2a2a2a] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.07em] text-[#8e9192]">
            Free
          </span>
        </div>
        <SettingRow label="Display name" description="Shown in the sidebar">
          <input
            defaultValue="John Doe"
            className="w-40 rounded border border-[#2a2a2a] bg-[#141313] px-2.5 py-1.5 text-[12px] text-[#c4c7c8] outline-none transition-colors hover:border-[#353434] focus:border-[#508eff]"
          />
        </SettingRow>
        <SettingRow label="Email" last>
          <input
            defaultValue="john@example.com"
            className="w-52 rounded border border-[#2a2a2a] bg-[#141313] px-2.5 py-1.5 text-[12px] text-[#c4c7c8] outline-none transition-colors hover:border-[#353434] focus:border-[#508eff]"
          />
        </SettingRow>
      </SettingCard>

      <SettingCard>
        <div className="px-4 py-3.5">
          <p className="text-[12px] font-medium text-[#c4c7c8]">Plan</p>
          <p className="mt-1 text-[11px] text-[#444748]">
            You are on the <strong className="text-[#8e9192]">Free</strong> plan. Upgrade to unlock AI summaries,
            unlimited notes, and shared workspaces.
          </p>
          <button className="mt-3 rounded border border-[#508eff]/40 bg-[#508eff]/10 px-3 py-1.5 text-[12px] font-medium text-[#aec6ff] transition-colors hover:bg-[#508eff]/20">
            Upgrade to Pro
          </button>
        </div>
      </SettingCard>

      <SettingCard>
        <div className="px-4 py-3.5">
          <p className="text-[12px] font-medium text-[#ffb4ab]">Danger zone</p>
          <p className="mt-0.5 text-[11px] text-[#444748]">
            Permanently delete your account and all data. This cannot be undone.
          </p>
          <button className="mt-3 rounded border border-[#ffb4ab]/30 px-3 py-1.5 text-[12px] text-[#ffb4ab] transition-colors hover:bg-[#ffb4ab]/10">
            Delete account
          </button>
        </div>
      </SettingCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("tags-categories");
  const activeSection = SECTIONS.find((s) => s.id === active)!;

  const content = {
    "tags-categories": <TagsCategoriesSection />,
    defaults: <DefaultsSection />,
    editor: <EditorSection />,
    account: <AccountSection />,
  }[active];

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#141313]">
      {/* Left nav */}
      <div className="flex w-52 shrink-0 flex-col border-r border-[#2a2a2a] bg-[#0e0e0e]">
        <div className="flex h-[60px] items-center border-b border-[#2a2a2a] px-5">
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#e5e2e1]">Settings</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors text-left",
                active === id
                  ? "bg-[#1c1b1b] text-[#e5e2e1]"
                  : "text-[#8e9192] hover:bg-[#1c1b1b] hover:text-[#c4c7c8]"
              )}
            >
              {active === id && (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#508eff]" />
              )}
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  active === id ? "text-[#aec6ff]" : "text-[#444748] group-hover:text-[#8e9192]"
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
        <div className="mx-auto max-w-2xl px-8 py-8">
          <SectionHeader title={activeSection.label} description={activeSection.description} />
          {content}
        </div>
      </ScrollArea>
    </div>
  );
}
