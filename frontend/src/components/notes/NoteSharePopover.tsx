"use client";

import { useState } from "react";
import {
  Globe, Lock, Link2, Check, Eye, Pencil,
  Ban, UserPlus, ChevronDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type Permission = "none" | "view" | "edit";

interface SharedPerson {
  email: string;
  permission: "view" | "edit";
}

const PERM_META: Record<Permission, { label: string; Icon: React.ElementType; desc: string }> = {
  none: { label: "No access",  Icon: Ban,    desc: "Only invited people can access" },
  view: { label: "Can view",   Icon: Eye,    desc: "Anyone with the link can view"  },
  edit: { label: "Can edit",   Icon: Pencil, desc: "Anyone with the link can edit"  },
};

function PermissionPicker({
  value,
  onChange,
  options = ["none", "view", "edit"] as Permission[],
  align = "end",
}: {
  value: Permission;
  onChange: (v: Permission) => void;
  options?: Permission[];
  align?: "start" | "end";
}) {
  const { label, Icon } = PERM_META[value];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon className="size-3.5 shrink-0" strokeWidth={1.5} />
          {label}
          <ChevronDown className="size-3 opacity-50" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} sideOffset={4} className="w-[140px] p-1">
        {options.map((opt) => {
          const { label: optLabel, Icon } = PERM_META[opt];
          const active = value === opt;
          return (
            <DropdownMenuItem
              key={opt}
              onClick={() => onChange(opt)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px]"
            >
              <Icon className="size-3.5 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
              <span className="flex-1 text-foreground/90">{optLabel}</span>
              {active && <Check className="size-3 text-blue" strokeWidth={2.5} />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface NoteSharePopoverProps {
  noteId: string;
  noteTitle: string;
  visibility: "private" | "public";
}

export function NoteSharePopover({ noteId, noteTitle, visibility }: NoteSharePopoverProps) {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<Permission>("view");
  const [linkPermission, setLinkPermission] = useState<Permission>(
    visibility === "public" ? "view" : "none"
  );
  const [people, setPeople] = useState<SharedPerson[]>([]);
  const [copied, setCopied] = useState(false);

  const noteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/notes/${noteId}`
      : `/notes/${noteId}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(noteUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  function handleInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setPeople((prev) => [
      ...prev.filter((p) => p.email !== email),
      { email, permission: invitePermission === "none" ? "view" : invitePermission },
    ]);
    setInviteEmail("");
  }

  function updatePersonPermission(email: string, perm: Permission) {
    if (perm === "none") {
      setPeople((prev) => prev.filter((p) => p.email !== email));
    } else {
      setPeople((prev) =>
        prev.map((p) => (p.email === email ? { ...p, permission: perm } : p))
      );
    }
  }

  const displayName = user?.name ?? "You";
  const ownerInitials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isShared = linkPermission !== "none" || people.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12.5px] font-medium transition-colors",
            isShared
              ? "text-blue/80 hover:text-blue hover:bg-blue/8"
              : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/50",
            open && (isShared ? "bg-blue/10 text-blue" : "bg-accent/50 text-foreground")
          )}
        >
          {isShared
            ? <Globe className="size-3.5" strokeWidth={1.5} />
            : <Lock className="size-3.5" strokeWidth={1.5} />}
          Share
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[400px] p-0 shadow-xl border-border/70 overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            Share
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground/50">
            {noteTitle || "Untitled"}
          </p>
        </div>

        {/* ── Invite input ── */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 transition-shadow focus-within:border-border-strong focus-within:shadow-[0_0_0_2px_var(--ring)/12%]">
            <UserPlus className="size-3.5 shrink-0 text-muted-foreground/40" strokeWidth={1.5} />
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              placeholder="Invite by email address…"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/35"
            />
            {inviteEmail.trim() && (
              <div className="flex shrink-0 items-center gap-1.5">
                <PermissionPicker
                  value={invitePermission}
                  onChange={setInvitePermission}
                  options={["view", "edit"]}
                  align="end"
                />
                <button
                  type="button"
                  onClick={handleInvite}
                  className="rounded-md bg-foreground px-3 py-1 text-[12px] font-medium text-background transition-opacity hover:opacity-80"
                >
                  Invite
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── People with access ── */}
        <div className="px-5 pb-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            People with access
          </p>

          <div className="space-y-0.5">
            {/* Owner */}
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <Avatar size="sm" className="shrink-0">
                <AvatarFallback className="bg-accent text-[10px] font-semibold text-muted-foreground">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{displayName}</p>
                {user?.email && (
                  <p className="truncate text-[11px] text-muted-foreground/45">{user.email}</p>
                )}
              </div>
              <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium text-muted-foreground/60">
                Owner
              </span>
            </div>

            {/* Invited people */}
            {people.map((person) => (
              <div
                key={person.email}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/40"
              >
                <Avatar size="sm" className="shrink-0">
                  <AvatarFallback className="bg-accent text-[10px] font-semibold text-muted-foreground">
                    {person.email.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-foreground/80">{person.email}</p>
                </div>
                <PermissionPicker
                  value={person.permission}
                  onChange={(v) => updatePersonPermission(person.email, v)}
                  options={["view", "edit", "none"]}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Link access ── */}
        <div className="border-t border-border/60 bg-muted/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                linkPermission !== "none"
                  ? "bg-blue/10 text-blue"
                  : "bg-accent text-muted-foreground/40"
              )}
            >
              <Globe className="size-4" strokeWidth={1.5} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-foreground">Anyone with the link</p>
              <p className="text-[11.5px] leading-snug text-muted-foreground/50">
                {PERM_META[linkPermission].desc}
              </p>
            </div>

            <PermissionPicker
              value={linkPermission}
              onChange={setLinkPermission}
              options={["none", "view", "edit"]}
            />
          </div>

          {/* Copy link row */}
          {linkPermission !== "none" && (
            <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-border/50 bg-background px-3 py-2">
              <Link2 className="size-3.5 shrink-0 text-muted-foreground/30" strokeWidth={1.5} />
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground/40">
                {noteUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all",
                  copied
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-accent text-foreground/70 hover:bg-accent/80 hover:text-foreground"
                )}
              >
                {copied ? (
                  <><Check className="size-3" strokeWidth={2.5} />Copied</>
                ) : (
                  <><Link2 className="size-3" strokeWidth={2} />Copy link</>
                )}
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
