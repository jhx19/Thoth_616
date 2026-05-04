import Link from "next/link";
import { MessageSquare, GraduationCap, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const roles = [
  {
    title: "User",
    description: "Ask questions and get answers grounded in approved expert knowledge.",
    href: "/user",
    icon: MessageSquare,
    cta: "Enter Chat",
  },
  {
    title: "SME",
    description: "Answer interviews, review draft entries, and respond to escalated questions.",
    href: "/sme/login",
    icon: GraduationCap,
    cta: "Open SME Workspace",
  },
  {
    title: "Admin",
    description: "Approve SME-reviewed knowledge, manage SMEs, and route escalations.",
    href: "/admin/approve",
    icon: ShieldCheck,
    cta: "Open Admin Console",
  },
];

export default function RoleSelectPage() {
  return (
    <div className="flex min-h-screen min-w-[1024px] items-center justify-center bg-page px-8 py-12">
      <div className="w-full max-w-[960px]">
        {/* Brand */}
        <div className="mb-10 flex items-center justify-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-magenta" />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            Thoth
          </span>
        </div>

        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="text-[24px] font-bold leading-tight text-ink">
            Select your role
          </h1>
          <p className="mt-2 text-sm text-muted">
            Choose how you&apos;d like to enter the MEZ knowledge system.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-3 gap-5">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.href}
                href={r.href}
                className="group flex flex-col rounded-card border border-line bg-card p-6 shadow-card transition-colors hover:border-magenta"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-card bg-magenta-50 text-magenta">
                  <Icon size={20} />
                </div>
                <h2 className="text-[18px] font-semibold text-ink">
                  {r.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {r.description}
                </p>
                <Button variant="primary" size="md" className="mt-5 w-full">
                  {r.cta}
                  <ArrowRight size={14} />
                </Button>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center text-[11px] text-muted">
          Answers are based on approved expert knowledge and do not constitute
          professional advice
        </p>
      </div>
    </div>
  );
}
