"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links: { label: string; href: string }[] = [
  { label: "Dashboard", href: "/sme/dashboard" },
  { label: "Interviews", href: "/sme/interview" },
  { label: "Knowledge Approval", href: "/sme/knowledge" },
  { label: "Escalated Questions", href: "/sme/escalated" },
];

export function SmeTopNav({ initials = "EV" }: { initials?: string }) {
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center border-b border-line bg-card px-6">
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-magenta" />
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          Thoth · SME
        </span>
      </Link>

      <nav
        className="flex flex-1 items-center justify-center"
        aria-label="SME portal"
      >
        <ul className="flex items-center gap-1">
          {links.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "relative inline-flex h-14 items-center px-4 text-sm text-ink/70 hover:text-ink",
                    active && "font-medium text-magenta",
                  )}
                >
                  <span>{l.label}</span>
                  {active && (
                    <span className="absolute inset-x-3 bottom-0 h-[2px] bg-magenta" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-magenta text-xs font-semibold text-white">
        {initials}
      </div>
    </header>
  );
}
