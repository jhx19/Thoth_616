"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};

export function SidebarNav({
  brand,
  items,
}: {
  brand: string;
  items: NavItem[];
}) {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-line bg-card">
      <div className="flex h-14 items-center px-5 border-b border-line">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-magenta" />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            {brand}
          </span>
        </Link>
      </div>
      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-input px-3 py-2 text-sm text-ink/80 hover:bg-page",
                    active &&
                      "bg-magenta-50 text-ink border-l-2 border-magenta pl-[10px]"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={cn(
                        "text-muted",
                        active && "text-magenta"
                      )}
                    />
                    <span className={cn(active && "font-medium")}>
                      {item.label}
                    </span>
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[11px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
