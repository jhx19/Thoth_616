import { SmeTopNav } from "@/components/layout/sme-topnav";

export function SmeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen min-w-[1024px] flex-col bg-page">
      <SmeTopNav initials="EV" />
      <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
    </div>
  );
}
