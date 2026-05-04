import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[640px] rounded-card bg-magenta px-4 py-2.5 text-sm text-white shadow-card">
        {content}
      </div>
    </div>
  );
}

export function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[640px] rounded-card bg-bubble-ai-bg px-4 py-2.5 text-sm text-bubble-ai-fg">
        {children}
      </div>
    </div>
  );
}

export function SmeBubble({
  smeName,
  content,
}: {
  smeName: string;
  content: string;
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[640px] rounded-card bg-bubble-sme-bg px-4 py-2.5 text-sm text-bubble-sme-fg">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-bubble-sme-fg/70">
          {smeName} · SME
        </div>
        {content}
      </div>
    </div>
  );
}

export function SourceCitation({
  title,
  approved_by,
  reviewed,
}: {
  title: string;
  approved_by: string;
  reviewed: string;
}) {
  return (
    <div className="mt-2 flex max-w-[640px] items-start gap-3 rounded-card border border-line bg-card px-3 py-2.5 shadow-card">
      <FileText size={16} className="mt-0.5 shrink-0 text-muted" />
      <div className="min-w-0 text-xs">
        <div className="font-medium text-ink">{title}</div>
        <div className="mt-0.5 text-muted">
          Approved by {approved_by} · Last Reviewed: {reviewed}
        </div>
      </div>
    </div>
  );
}

export function ChipButtons({
  chips,
  onPick,
}: {
  chips: string[];
  onPick?: (c: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {chips.map((c) => (
        <Button
          key={c}
          variant="chip"
          size="sm"
          className="rounded-full"
          onClick={() => onPick?.(c)}
        >
          {c}
        </Button>
      ))}
    </div>
  );
}

export function SmeRecommendCard({
  name,
  specialization,
  reason,
  asked,
  onAsk,
}: {
  name: string;
  specialization: string;
  reason: string;
  email: string;
  asked: boolean;
  onAsk: () => void;
}) {
  const initials = name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-[260px] shrink-0 rounded-card border border-line bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-magenta text-xs font-semibold text-white">
          {initials}
        </div>
        <div>
          <div className="text-sm font-medium text-ink">{name}</div>
          <div className="text-xs text-muted">{specialization}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-ink/80">
        <span className="text-muted">Reason: </span>
        {reason}
      </div>

      <div className="mt-3">
        {asked ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-input bg-[#F3F4F6] px-3 py-2 text-xs font-medium text-muted"
          >
            Question sent · {name} has been notified
          </button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={onAsk}
          >
            Ask this SME directly
          </Button>
        )}
        <p className="mt-2 text-[11px] text-muted">
          You&apos;ll see their response in this conversation
        </p>
      </div>
    </div>
  );
}
