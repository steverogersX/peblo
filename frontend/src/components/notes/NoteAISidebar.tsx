"use client";

import { useState } from "react";
import {
  Sparkles,
  X,
  Loader2,
  RotateCcw,
  AlignLeft,
  ListChecks,
  Clock,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { notesApi } from "@/lib/api/notes";
import type { Note } from "@/lib/schemas/note";

interface NoteAISidebarProps {
  note: Note;
  onClose: () => void;
  onSummaryGenerated: (patch: Partial<Note>) => void;
}

export function NoteAISidebar({ note, onClose, onSummaryGenerated }: NoteAISidebarProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(note.aiSummary ?? null);
  const [actionItems, setActionItems] = useState<string[]>(note.aiActionItems ?? []);
  const [generatedAt, setGeneratedAt] = useState<string | null>(note.aiGeneratedAt ?? null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const updated = await notesApi.summarize(note.id);
      const patch: Partial<Note> = {
        aiSummary: updated.aiSummary,
        aiActionItems: updated.aiActionItems,
        aiGeneratedAt: updated.aiGeneratedAt,
      };
      setSummary(updated.aiSummary ?? null);
      setActionItems(updated.aiActionItems ?? []);
      setGeneratedAt(updated.aiGeneratedAt ?? null);
      onSummaryGenerated(patch);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const hasSummary = !!summary;

  return (
    <div className="flex h-full w-full flex-col bg-background">

      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-[22px] items-center justify-center rounded bg-blue-500/15">
            <Sparkles className="size-3 text-blue-400" strokeWidth={2} />
          </div>
          <span className="text-[13px] font-medium tracking-tight">AI Summary</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="size-6 text-muted-foreground/60 hover:text-foreground"
        >
          <X className="size-3.5" strokeWidth={1.5} />
        </Button>
      </div>

      {/* ── Body ── */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">

          {/* Generate / Regenerate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-[13px] font-medium transition-all",
              "disabled:cursor-not-allowed disabled:opacity-60",
              hasSummary
                ? "border-border/60 bg-transparent text-foreground hover:bg-accent"
                : "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                Generating…
              </>
            ) : hasSummary ? (
              <>
                <RotateCcw className="size-3.5" strokeWidth={1.5} />
                Regenerate
              </>
            ) : (
              <>
                <Wand2 className="size-3.5" strokeWidth={1.5} />
                Generate summary
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
              {error}
            </p>
          )}

          {/* Loading skeleton */}
          {isGenerating && (
            <div className="space-y-2 pt-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[85%]" />
              <Skeleton className="h-3 w-[70%]" />
              <div className="pt-1" />
              <Skeleton className="h-3 w-[55%]" />
              <Skeleton className="h-3 w-[78%]" />
              <Skeleton className="h-3 w-[62%]" />
            </div>
          )}

          {/* ── Summary & action items ── */}
          {hasSummary && !isGenerating && (
            <div className="space-y-3">

              {/* Summary block */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <AlignLeft className="size-3 text-muted-foreground/60" strokeWidth={1.5} />
                  <span className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Summary
                  </span>
                </div>
                <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-2.5">
                  <p className="text-[13px] leading-[1.65] text-foreground/85">{summary}</p>
                </div>
              </div>

              {/* Action items */}
              {actionItems.length > 0 && (
                <>
                  <Separator className="bg-border/40" />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <ListChecks className="size-3 text-muted-foreground/60" strokeWidth={1.5} />
                      <span className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Action Items
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className="mt-[7px] size-1.5 shrink-0 rounded-full bg-blue-400/70" />
                          <span className="text-[13px] leading-[1.6] text-foreground/80">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Timestamp */}
              {generatedAt && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground/40">
                  <Clock className="size-2.5" strokeWidth={1.5} />
                  {new Date(generatedAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!hasSummary && !isGenerating && !error && (
            <div className="flex flex-col items-center gap-2.5 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted/40">
                <Sparkles className="size-4 text-muted-foreground/30" strokeWidth={1.5} />
              </div>
              <p className="max-w-[190px] text-[12px] leading-relaxed text-muted-foreground/50">
                Generate a concise summary and extract key action items from this note.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
