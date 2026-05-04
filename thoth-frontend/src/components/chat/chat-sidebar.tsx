"use client";

import Link from "next/link";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChatSessionListItem = { id: string; first: string; ts: string };

export function ChatSidebar({
  sessions,
  activeId,
  onSelect,
  onNewChat,
}: {
  sessions: ChatSessionListItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}) {
  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-line bg-card">
      <Link
        href="/"
        className="flex h-14 items-center gap-2 border-b border-line px-4 hover:bg-page"
      >
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-magenta" />
        <span className="text-[15px] font-semibold text-ink">Thoth</span>
      </Link>
      <div className="p-3">
        <Button
          type="button"
          aria-label="Start new chat conversation"
          onClick={onNewChat}
          className="w-full"
          size="md"
        >
          <Plus size={16} />
          New Chat
        </Button>
      </div>
      <div className="px-3 pb-2 text-[11px] uppercase tracking-wide text-muted">
        Recent
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-3">
        {sessions.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-muted">
            No chats yet. Send a message to start your first conversation.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {sessions.map((c) => {
              const active = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-input px-3 py-2 text-left text-sm text-ink/80 hover:bg-page",
                      active && "border-l-2 border-magenta bg-magenta-50 pl-[10px]",
                    )}
                  >
                    <MessageSquare
                      size={14}
                      className={cn(
                        "mt-0.5 shrink-0 text-muted",
                        active && "text-magenta",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] leading-tight">
                        {c.first}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {c.ts}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}
