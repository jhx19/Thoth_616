"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { smeEscalated } from "@/lib/mock-data";

const links: { label: string; href: string; badgeKey?: "escalated" }[] = [
  { label: "Dashboard", href: "/sme/dashboard" },
  { label: "Interviews", href: "/sme/interview" },
  { label: "Knowledge Approval", href: "/sme/knowledge" },
  { label: "Escalated Questions", href: "/sme/escalated", badgeKey: "escalated" },
];

export function SmeTopNav({ initials = "EV" }: { initials?: string }) {
  const pathname = usePathname();
  const escalatedCount = smeEscalated.length;

  return (
    <header className="flex h-14 items-center border-b border-line bg-card px-6">
      {/* Wordmark — left */}
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-magenta" />
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          Thoth · SME
        </span>
      </Link>

      {/* Links — center */}
      <nav className="flex flex-1 items-center justify-center">
        <ul className="flex items-center gap-1">
          {links.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/" && pathname.startsWith(l.href));
            const showBadge = l.badgeKey === "escalated" && escalatedCount > 0;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "relative inline-flex h-14 items-center px-4 text-sm text-ink/70 hover:text-ink",
                    active && "font-medium text-magenta"
                  )}
                >
                  <span className="relative">
                    {l.label}
                    {showBadge && (
                      <span
                        aria-label={`${escalatedCount} unanswered`}
                        className="absolute -right-3 -top-2 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-magenta px-1 text-[11px] font-semibold leading-none text-white"
                      >
                        {escalatedCount}
                      </span>
                    )}
                  </span>
                  {active && (
                    <span className="absolute inset-x-3 bottom-0 h-[2px] bg-magenta" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Avatar — right */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-magenta text-xs font-semibold text-white">
        {initials}
      </div>
    </header>
  );
}
