"use client";

import { useState, useEffect } from "react";
import {
  Globe, Lock, Link2, Check, Eye, Pencil,
  Ban, ChevronDown,
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
import { cn } from "@/lib/utils";
import type { ShareLinkPermission } from "@peblo/shared";

type Permission = ShareLinkPermission;

const PERM_META: Record<Permission, { label: string; Icon: React.ElementType; desc: string }> = {
  none: { label: "No access",  Icon: Ban,    desc: "Link sharing is disabled" },
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
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
          />
        }
      >
        <Icon className="size-3.5 shrink-0" strokeWidth={1.5} />
        {label}
        <ChevronDown className="size-3 opacity-50" strokeWidth={1.5} />
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
  shareLinkPermission: ShareLinkPermission;
  shareToken: string | null;
  onLinkPermissionChange: (perm: ShareLinkPermission) => void;
}

export function NoteSharePopover({
  noteTitle,
  shareLinkPermission,
  shareToken,
  onLinkPermissionChange,
}: NoteSharePopoverProps) {
  const [open, setOpen] = useState(false);
  const [linkPermission, setLinkPermission] = useState<Permission>(shareLinkPermission);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLinkPermission(shareLinkPermission);
  }, [shareLinkPermission]);

  const noteUrl =
    shareToken
      ? typeof window !== "undefined"
        ? `${window.location.origin}/view/${shareToken}`
        : `/view/${shareToken}`
      : null;

  function handleCopyLink() {
    if (!noteUrl) return;
    navigator.clipboard.writeText(noteUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  function handleLinkPermissionChange(perm: Permission) {
    setLinkPermission(perm);
    onLinkPermissionChange(perm);
  }

  const isShared = linkPermission !== "none";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12.5px] font-medium transition-colors",
              isShared
                ? "text-blue/80 hover:text-blue hover:bg-blue/8"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/50",
              open && (isShared ? "bg-blue/10 text-blue" : "bg-accent/50 text-foreground")
            )}
          />
        }
      >
        {isShared
          ? <Globe className="size-3.5" strokeWidth={1.5} />
          : <Lock className="size-3.5" strokeWidth={1.5} />}
        Share
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[380px] p-0 shadow-xl border-border/70 overflow-hidden"
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

        {/* ── Link access ── */}
        <div className="px-5 pb-5">
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
              onChange={handleLinkPermissionChange}
              options={["none", "view", "edit"]}
            />
          </div>

          {/* Copy link row */}
          {linkPermission !== "none" && (
            <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-border/50 bg-background px-3 py-2">
              <Link2 className="size-3.5 shrink-0 text-muted-foreground/30" strokeWidth={1.5} />
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground/40">
                {noteUrl ?? "Generating link…"}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                disabled={!noteUrl}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all disabled:opacity-40",
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
