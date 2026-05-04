"use client";

import {
  Home,
  Users,
  CheckSquare,
  Library,
  PlayCircle,
  AlertOctagon,
} from "lucide-react";
import { SidebarNav, type NavItem } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";

const items: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Home },
  { label: "Manage SMEs", href: "/admin/smes", icon: Users },
  { label: "Approve Knowledge", href: "/admin/approve", icon: CheckSquare },
  { label: "Knowledge Base", href: "/admin/knowledge", icon: Library },
  { label: "Start Interview", href: "/admin/interview/new", icon: PlayCircle },
  {
    label: "Escalated Questions",
    href: "/admin/escalated",
    icon: AlertOctagon,
    badge: 1,
  },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen min-w-[1024px] bg-page">
      <SidebarNav brand="Thoth · Admin" items={items} />
      <div className="flex flex-1 flex-col">
        <TopBar title={title} initials="LP" />
        <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
