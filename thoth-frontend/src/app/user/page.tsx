"use client";

import { useEffect, useRef, useState } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatInput } from "@/components/chat/chat-input";
import {
  AiBubble,
  ChipButtons,
  SmeBubble,
  SmeRecommendCard,
  SourceCitation,
  UserBubble,
} from "@/components/chat/message-bubbles";
import { sampleChat, type ChatMessage } from "@/lib/mock-data";

// Mocked SME replies, keyed by email
const SME_REPLIES: Record<string, string> = {
  "n.okafor@mez.org":
    "Thanks for reaching out. To file with the MEZ Tribunal, you must first submit Form T-14 within 30 days of the dispute, attach all supporting evidence indexed by Article reference, and pay the filing fee through the Tribunal Registry portal.",
};

function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `sess_${crypto.randomUUID()}`;
  }
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState("c1");
  const [messages, setMessages] = useState<ChatMessage[]>(sampleChat);
  const [askedSmes, setAskedSmes] = useState<Set<string>>(new Set());
  const [sessionId, setSessionId] = useState<string>(() => newSessionId());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function onSend(msg: string) {
    setMessages((m) => [...m, { role: "user", content: msg }]);
  }

  function onNewChat() {
    setMessages([]);
    setAskedSmes(new Set());
    setActiveChat("");
    setSessionId(newSessionId());
  }

  function onAskSme(sme: { name: string; email: string }) {
    if (askedSmes.has(sme.email)) return;
    setAskedSmes((prev) => new Set(prev).add(sme.email));

    const reply =
      SME_REPLIES[sme.email] ??
      `Thanks for reaching out. ${sme.name} will respond shortly with guidance on your question.`;

    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "sme", sme_name: sme.name, content: reply },
      ]);
    }, 1500);
  }

  return (
    <div
      className="flex h-screen min-w-[1024px] bg-page"
      data-session-id={sessionId}
    >
      <ChatSidebar
        activeId={activeChat}
        onSelect={setActiveChat}
        onNewChat={onNewChat}
      />

      <main className="flex flex-1 flex-col">
        <div className="flex h-10 items-center justify-center border-b border-line bg-card px-6 text-center">
          <p className="text-[12px] text-muted">
            Answers are based on approved expert knowledge and do not constitute
            professional advice
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6"
        >
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              messages.map((m, i) => (
                <RenderMessage
                  key={i}
                  m={m}
                  askedSmes={askedSmes}
                  onAskSme={onAskSme}
                />
              ))
            )}
          </div>
        </div>

        <ChatInput onSend={onSend} />
      </main>
    </div>
  );
}

function RenderMessage({
  m,
  askedSmes,
  onAskSme,
}: {
  m: ChatMessage;
  askedSmes: Set<string>;
  onAskSme: (sme: { name: string; email: string }) => void;
}) {
  if (m.role === "user") return <UserBubble content={m.content} />;

  if (m.role === "sme") {
    return <SmeBubble smeName={m.sme_name} content={m.content} />;
  }

  if (m.type === "answer") {
    return (
      <div>
        <AiBubble>{m.content}</AiBubble>
        <SourceCitation
          title={m.source.title}
          approved_by={m.source.approved_by}
          reviewed={m.source.reviewed}
        />
      </div>
    );
  }

  if (m.type === "clarification") {
    return (
      <div>
        <AiBubble>{m.content}</AiBubble>
        <ChipButtons chips={m.chips} />
      </div>
    );
  }

  // routing
  return (
    <div>
      <AiBubble>{m.content}</AiBubble>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {m.smes.map((s) => (
          <SmeRecommendCard
            key={s.email}
            {...s}
            asked={askedSmes.has(s.email)}
            onAsk={() => onAskSme({ name: s.name, email: s.email })}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-magenta-50 text-magenta">
        <span className="text-lg font-semibold">T</span>
      </div>
      <h2 className="text-[18px] font-semibold text-ink">
        Ask Thoth about MEZ regulation
      </h2>
      <p className="mt-1 text-sm text-muted">
        Answers come from approved expert knowledge. Try a question below.
      </p>
    </div>
  );
}
