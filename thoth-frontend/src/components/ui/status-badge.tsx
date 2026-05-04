import { cn } from "@/lib/utils";
import type { EntryStatus } from "@/lib/mock-data";

const STATUS_LABEL: Record<EntryStatus, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  sme_approved: "SME Approved",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

const STATUS_CLASS: Record<EntryStatus, string> = {
  draft: "bg-status-draft-bg text-status-draft-fg",
  in_progress: "bg-status-in-progress-bg text-status-in-progress-fg",
  sme_approved: "bg-status-sme-approved-bg text-status-sme-approved-fg",
  approved: "bg-status-approved-bg text-status-approved-fg",
  rejected: "bg-status-rejected-bg text-status-rejected-fg",
  completed: "bg-status-completed-bg text-status-completed-fg",
};

export function StatusBadge({
  status,
  className,
}: {
  status: EntryStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-badge px-2 py-0.5 text-xs font-medium",
        STATUS_CLASS[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
