"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BrainCircuit,
  X,
  Loader2,
  RotateCcw,
  AlignLeft,
  ListChecks,
  Lightbulb,
  Clock,
  Wand2,
  AlertCircle,
  WifiOff,
  Check,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { notesApi } from "@/lib/api/notes";
import type { Note } from "@/lib/schemas/note";

interface NoteAISidebarProps {
  note: Note;
  onClose: () => void;
  onSummaryGenerated: (patch: Partial<Note>) => void;
  onApplyTitle?: (title: string) => void;
}

type ErrorKind = "rate_limit" | "quota_zero" | "not_configured" | "access_denied" | "generic";

interface SidebarError {
  kind: ErrorKind;
  detail: string;
  retryAt?: number;
}

const RATE_LIMIT_COOLDOWN = 30;

function parseError(message: string): SidebarError {
  if (message.startsWith("QUOTA_ZERO")) {
    return { kind: "quota_zero", detail: message };
  }
  if (message.startsWith("RATE_LIMIT")) {
    return {
      kind: "rate_limit",
      detail: "The Mistral rate limit was reached.",
      retryAt: Date.now() + RATE_LIMIT_COOLDOWN * 1000,
    };
  }
  if (message.toLowerCase().includes("not configured")) {
    return { kind: "not_configured", detail: message };
  }
  if (
    message.toLowerCase().includes("access denied") ||
    message.toLowerCase().includes("api is enabled") ||
    message.toLowerCase().includes("forbidden")
  ) {
    return { kind: "access_denied", detail: message };
  }
  if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("mistral_model")) {
    return { kind: "access_denied", detail: message };
  }
  return { kind: "generic", detail: message };
}

// ── Skeleton row ───────────────────────────────────────────────────
function SkeletonLine({ w = "100%", delay = "0ms" }: { w?: string; delay?: string }) {
  return (
    <div
      className="h-[11px] rounded-full bg-muted/50 animate-pulse"
      style={{ width: w, animationDelay: delay }}
    />
  );
}

// ── Section wrapper ────────────────────────────────────────────────
function Section({
  icon: Icon,
  label,
  children,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Icon
          className={cn("size-[13px] shrink-0", accent ?? "text-muted-foreground/40")}
          strokeWidth={1.75}
        />
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40 select-none">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export function NoteAISidebar({
  note,
  onClose,
  onSummaryGenerated,
  onApplyTitle,
}: NoteAISidebarProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [err, setErr] = useState<SidebarError | null>(null);
  const [summary, setSummary] = useState<string | null>(note.aiSummary ?? null);
  const [actionItems, setActionItems] = useState<string[]>(note.aiActionItems ?? []);
  const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(note.aiGeneratedAt ?? null);
  const [titleApplied, setTitleApplied] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  useEffect(() => {
    setSummary(note.aiSummary ?? null);
    setActionItems(note.aiActionItems ?? []);
    setGeneratedAt(note.aiGeneratedAt ?? null);
    setSuggestedTitle(null);
    setTitleApplied(false);
    setErr(null);
    clearTimer();
  }, [note.id, clearTimer]);

  const startCountdown = useCallback((retryAt: number) => {
    clearTimer();
    const tick = () => {
      const s = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
      setCountdown(s);
      if (s === 0) clearTimer();
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, [clearTimer]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErr(null);
    setTitleApplied(false);
    try {
      const result = await notesApi.summarize(note.id);
      setSummary(result.note.aiSummary ?? null);
      setActionItems(result.note.aiActionItems ?? []);
      setGeneratedAt(result.note.aiGeneratedAt ?? null);
      setSuggestedTitle(result.suggestedTitle ?? null);
      onSummaryGenerated({
        aiSummary: result.note.aiSummary,
        aiActionItems: result.note.aiActionItems,
        aiGeneratedAt: result.note.aiGeneratedAt,
      });
    } catch (e) {
      const parsed = parseError(e instanceof Error ? e.message : "Failed to generate");
      setErr(parsed);
      if (parsed.retryAt) startCountdown(parsed.retryAt);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasSummary = !!summary;
  const isRateLimited = err?.kind === "rate_limit" && countdown > 0;

  return (
    <div className="flex h-full w-full flex-col bg-background">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="relative flex shrink-0 items-center justify-between px-4 py-3 border-b border-border/30">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-[#508eff]/0 via-[#508eff]/40 to-[#508eff]/0" />

        <div className="flex items-center gap-2.5">
          <div className="relative flex size-6 items-center justify-center rounded-md bg-foreground/8 ring-1 ring-foreground/12">
            <Sparkles className="size-3.5 text-foreground" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[12.5px] font-semibold tracking-tight text-foreground/85">AI Summary</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="size-6 text-muted-foreground/35 hover:text-muted-foreground/70 hover:bg-accent/50"
        >
          <X className="size-3.5" strokeWidth={1.5} />
        </Button>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────── */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-4 space-y-5">

          {/* ── Generate button ─────────────────────────────────── */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || isRateLimited}
            className={cn(
              "group relative w-full flex items-center justify-center gap-2",
              "rounded-lg border px-3 py-2.5 text-[12.5px] font-medium",
              "transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
              hasSummary
                ? "border-border/40 bg-transparent text-foreground/60 hover:border-border/70 hover:bg-accent/40 hover:text-foreground/80"
                : "border-[#508eff]/30 bg-[#508eff]/8 text-[#508eff] hover:bg-[#508eff]/14 hover:border-[#508eff]/50"
            )}
          >
            {isGenerating ? (
              <><Loader2 className="size-3.5 animate-spin" strokeWidth={2} />Generating…</>
            ) : isRateLimited ? (
              <><Clock className="size-3.5" strokeWidth={1.5} />Retry in {countdown}s</>
            ) : hasSummary ? (
              <><RotateCcw className="size-3.5 transition-transform group-hover:-rotate-45 duration-300" strokeWidth={1.5} />Regenerate</>
            ) : (
              <><Wand2 className="size-3.5" strokeWidth={1.5} />Generate insights</>
            )}
          </button>

          {/* ── Error card ──────────────────────────────────────── */}
          {err && !isGenerating && (
            <div className={cn(
              "rounded-lg border px-3.5 py-3 space-y-1.5",
              err.kind === "rate_limit"   ? "border-amber-500/20 bg-amber-500/6"
              : err.kind === "quota_zero" ? "border-orange-500/20 bg-orange-500/6"
              : err.kind === "not_configured" ? "border-border/30 bg-muted/15"
              : "border-destructive/20 bg-destructive/6"
            )}>
              <div className="flex items-center gap-2">
                {err.kind === "rate_limit"      && <Clock       className="size-3.5 text-amber-400/80"          strokeWidth={1.5} />}
                {err.kind === "quota_zero"      && <ShieldAlert  className="size-3.5 text-orange-400/80"         strokeWidth={1.5} />}
                {err.kind === "not_configured"  && <WifiOff      className="size-3.5 text-muted-foreground/50"   strokeWidth={1.5} />}
                {err.kind === "access_denied"   && <ShieldAlert  className="size-3.5 text-destructive/70"        strokeWidth={1.5} />}
                {err.kind === "generic"         && <AlertCircle  className="size-3.5 text-destructive/70"        strokeWidth={1.5} />}
                <span className={cn(
                  "text-[12px] font-medium",
                  err.kind === "rate_limit"     ? "text-amber-400/90"
                  : err.kind === "quota_zero"   ? "text-orange-400/90"
                  : err.kind === "not_configured" ? "text-muted-foreground/60"
                  : "text-destructive/80"
                )}>
                  {err.kind === "rate_limit"      ? "Rate limit reached"
                    : err.kind === "quota_zero"   ? "No free-tier quota"
                    : err.kind === "not_configured" ? "AI not configured"
                    : err.kind === "access_denied"  ? "Access denied"
                    : "Generation failed"}
                </span>
              </div>
              <p className={cn(
                "text-[11.5px] leading-relaxed",
                err.kind === "rate_limit"       ? "text-amber-400/60"
                : err.kind === "quota_zero"     ? "text-orange-400/60"
                : err.kind === "not_configured" ? "text-muted-foreground/40"
                : "text-destructive/60"
              )}>
                {err.kind === "rate_limit"
                  ? countdown > 0
                    ? `Please wait ${countdown}s before trying again.`
                    : "You can try again now."
                  : err.kind === "quota_zero"
                  ? "This API key has no quota. Check your MISTRAL_API_KEY at console.mistral.ai."
                  : err.kind === "not_configured"
                  ? "Add MISTRAL_API_KEY to backend .env and restart the server."
                  : err.detail}
              </p>
            </div>
          )}

          {/* ── Loading skeletons ────────────────────────────────── */}
          {isGenerating && (
            <div className="space-y-5 pt-1">
              <div className="space-y-2.5">
                <SkeletonLine w="35%" delay="0ms" />
                <SkeletonLine w="100%" delay="60ms" />
                <SkeletonLine w="90%" delay="120ms" />
                <SkeletonLine w="68%" delay="180ms" />
              </div>
              <div className="space-y-2.5">
                <SkeletonLine w="42%" delay="240ms" />
                <SkeletonLine w="82%" delay="300ms" />
                <SkeletonLine w="74%" delay="360ms" />
              </div>
              <div className="space-y-2.5">
                <SkeletonLine w="30%" delay="420ms" />
                <SkeletonLine w="60%" delay="480ms" />
              </div>
            </div>
          )}

          {/* ── Results ──────────────────────────────────────────── */}
          {hasSummary && !isGenerating && (
            <div className="space-y-5">

              {/* Summary */}
              <Section icon={AlignLeft} label="Summary">
                <div className="rounded-lg bg-muted/20 border border-border/25 px-3.5 py-3">
                  <div className={cn(
                    "text-[12.5px] leading-[1.72] text-foreground/75 tracking-[0.01em]",
                    "[&_h1]:text-[13px] [&_h1]:font-semibold [&_h1]:text-foreground/85 [&_h1]:mb-1.5 [&_h1]:mt-3 [&_h1:first-child]:mt-0",
                    "[&_h2]:text-[12.5px] [&_h2]:font-semibold [&_h2]:text-foreground/80 [&_h2]:mb-1 [&_h2]:mt-3 [&_h2:first-child]:mt-0",
                    "[&_h3]:text-[12px] [&_h3]:font-medium [&_h3]:text-foreground/75 [&_h3]:mb-1 [&_h3]:mt-2.5 [&_h3:first-child]:mt-0",
                    "[&_p]:mb-2 [&_p:last-child]:mb-0",
                    "[&_ul]:mb-2 [&_ul]:ml-3 [&_ul]:space-y-0.5 [&_ul:last-child]:mb-0",
                    "[&_ol]:mb-2 [&_ol]:ml-3 [&_ol]:space-y-0.5 [&_ol:last-child]:mb-0",
                    "[&_li]:leading-[1.6]",
                    "[&_ul>li]:list-disc [&_ol>li]:list-decimal",
                    "[&_strong]:font-semibold [&_strong]:text-foreground/85",
                    "[&_em]:italic [&_em]:text-foreground/70",
                    "[&_code]:text-[11.5px] [&_code]:font-mono [&_code]:bg-muted/40 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded",
                    "[&_pre]:bg-muted/30 [&_pre]:rounded-md [&_pre]:p-2.5 [&_pre]:mb-2 [&_pre]:overflow-x-auto",
                    "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
                    "[&_blockquote]:border-l-2 [&_blockquote]:border-border/40 [&_blockquote]:pl-3 [&_blockquote]:text-foreground/55 [&_blockquote]:mb-2",
                    "[&_a]:text-[#508eff] [&_a]:underline [&_a]:underline-offset-2",
                    "[&_hr]:border-border/25 [&_hr]:my-2",
                    "[&_table]:w-full [&_table]:text-[11.5px] [&_table]:mb-2",
                    "[&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground/70 [&_th]:pb-1 [&_th]:border-b [&_th]:border-border/30",
                    "[&_td]:py-1 [&_td]:border-b [&_td]:border-border/15",
                  )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summary ?? ""}
                    </ReactMarkdown>
                  </div>
                </div>
              </Section>

              {/* Action items */}
              {actionItems.length > 0 && (
                <>
                  <div className="h-px bg-border/20" />
                  <Section icon={ListChecks} label="Action Items">
                    <ul className="space-y-2">
                      {actionItems.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 rounded-md px-2 py-1.5 hover:bg-accent/20 transition-colors duration-100 group/item"
                        >
                          <div className="mt-[5px] size-[5px] shrink-0 rounded-full bg-[#508eff]/50 group-hover/item:bg-[#508eff]/80 transition-colors" />
                          <span className="text-[12.5px] leading-[1.6] text-foreground/70">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                </>
              )}

              {/* Suggested title */}
              {suggestedTitle && suggestedTitle !== note.title && (
                <>
                  <div className="h-px bg-border/20" />
                  <Section icon={Lightbulb} label="Suggested Title" accent="text-[#508eff]/50">
                    <div className="rounded-lg border border-[#508eff]/15 bg-[#508eff]/5 px-3.5 py-3">
                      <p className="text-[12.5px] leading-snug text-foreground/80 mb-2.5">
                        {suggestedTitle}
                      </p>
                      <button
                        onClick={() => {
                          onApplyTitle?.(suggestedTitle);
                          setTitleApplied(true);
                        }}
                        disabled={titleApplied}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
                          titleApplied
                            ? "text-emerald-400/80 bg-emerald-400/8 cursor-default"
                            : "text-[#508eff]/80 bg-[#508eff]/10 hover:bg-[#508eff]/18 hover:text-[#508eff]"
                        )}
                      >
                        {titleApplied
                          ? <><Check className="size-3" strokeWidth={2.5} />Applied</>
                          : "Apply title"}
                      </button>
                    </div>
                  </Section>
                </>
              )}

              {/* Timestamp */}
              {generatedAt && (
                <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground/30 select-none pt-1">
                  <Clock className="size-2.5 shrink-0" strokeWidth={1.5} />
                  Generated{" "}
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

          {/* ── Empty state ──────────────────────────────────────── */}
          {!hasSummary && !isGenerating && !err && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="relative">
                <div className="size-14 rounded-2xl bg-[#508eff]/6 ring-1 ring-[#508eff]/12 flex items-center justify-center">
                  <BrainCircuit className="size-6 text-[#508eff]/25" strokeWidth={1.25} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-background flex items-center justify-center ring-1 ring-border/30">
                  <Wand2 className="size-2.5 text-muted-foreground/30" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[13px] font-medium text-foreground/40">No insights yet</p>
                <p className="max-w-[180px] text-[11.5px] leading-relaxed text-muted-foreground/30">
                  Summarize this note, extract action items, and get a title suggestion.
                </p>
              </div>
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  );
}
