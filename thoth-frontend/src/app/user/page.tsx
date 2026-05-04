"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChatSidebar,
  type ChatSessionListItem,
} from "@/components/chat/chat-sidebar";
import { ChatInput } from "@/components/chat/chat-input";
import {
  AiBubble,
  ChipButtons,
  SmeBubble,
  SmeRecommendCard,
  SourceCitation,
  UserBubble,
} from "@/components/chat/message-bubbles";
import {
  ApiError,
  postQuery,
  type ChatMessage,
  type QueryResponse,
} from "@/lib/api";

const LS_KEY = "thoth_user_chats_v1";

const SME_REPLIES: Record<string, string> = {
  "n.okafor@mez.org":
    "Thanks for reaching out. To file with the MEZ Tribunal, you must first submit Form T-14 within 30 days of the dispute, attach all supporting evidence indexed by Article reference, and pay the filing fee through the Tribunal Registry portal.",
};

type PersistedChat = {
  session_id: string;
  messages: ChatMessage[];
  asked_smes: string[];
  updatedAt: number;
};

function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `sess_${crypto.randomUUID()}`;
  }
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function loadChatMap(): Record<string, PersistedChat> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PersistedChat>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveChatMap(map: Record<string, PersistedChat>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function previewFromMessages(m: ChatMessage[]): string {
  const u = m.find((x) => x.role === "user");
  if (!u || u.role !== "user") return "New chat";
  const t = u.content.trim();
  return t.length > 72 ? `${t.slice(0, 72)}…` : t || "New chat";
}

function formatSessionTs(ts: number): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function responseToMessage(res: QueryResponse): ChatMessage {
  const content = res.content ?? res.message ?? "";
  if (res.type === "clarification") {
    return {
      role: "ai",
      type: "clarification",
      content,
      chips: res.chips ?? [],
    };
  }
  if (res.type === "routing") {
    return {
      role: "ai",
      type: "routing",
      content,
      smes: (res.smes ?? []).map((s) => ({
        name: s.name,
        specialization: s.specialization ?? "",
        reason: s.reason ?? "",
        email: s.email ?? "",
      })),
    };
  }
  return {
    role: "ai",
    type: "answer",
    content: content || "I don't have an answer for that yet.",
    source: {
      title: res.source?.title ?? "Approved knowledge",
      approved_by: res.source?.approved_by ?? "—",
      reviewed: res.source?.reviewed ?? "—",
    },
  };
}

export default function ChatPage() {
  const [chatMap, setChatMap] = useState<Record<string, PersistedChat>>({});
  const [hydrated, setHydrated] = useState(false);
  const [activeChat, setActiveChat] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [askedSmes, setAskedSmes] = useState<Set<string>>(new Set());
  const [sessionId, setSessionId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const persist = useCallback(
    (
      chatId: string,
      next: {
        session_id: string;
        messages: ChatMessage[];
        asked_smes: Set<string>;
      },
    ) => {
      setChatMap((prev) => {
        const row: PersistedChat = {
          session_id: next.session_id,
          messages: next.messages,
          asked_smes: Array.from(next.asked_smes),
          updatedAt: Date.now(),
        };
        const merged = { ...prev, [chatId]: row };
        saveChatMap(merged);
        return merged;
      });
    },
    [],
  );

  useEffect(() => {
    const map = loadChatMap();
    const ids = Object.keys(map);
    if (ids.length > 0) {
      const latest = ids.reduce((a, b) =>
        map[b].updatedAt > map[a].updatedAt ? b : a,
      );
      setChatMap(map);
      setActiveChat(latest);
      setSessionId(map[latest].session_id);
      setMessages(map[latest].messages ?? []);
      setAskedSmes(new Set(map[latest].asked_smes ?? []));
    } else {
      const id = newSessionId();
      const initial: PersistedChat = {
        session_id: id,
        messages: [],
        asked_smes: [],
        updatedAt: Date.now(),
      };
      const merged = { [id]: initial };
      saveChatMap(merged);
      setChatMap(merged);
      setActiveChat(id);
      setSessionId(id);
      setMessages([]);
      setAskedSmes(new Set());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const sessions: ChatSessionListItem[] = useMemo(() => {
    return Object.entries(chatMap)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
      .map(([id, c]) => ({
        id,
        first: previewFromMessages(c.messages),
        ts: formatSessionTs(c.updatedAt),
      }));
  }, [chatMap]);

  const chatMapRef = useRef(chatMap);
  chatMapRef.current = chatMap;

  const selectChat = useCallback((id: string) => {
    const c = chatMapRef.current[id];
    if (!c) return;
    setActiveChat(id);
    setSessionId(c.session_id);
    setMessages(c.messages);
    setAskedSmes(new Set(c.asked_smes ?? []));
    setError(null);
  }, []);

  async function onSend(question: string) {
    if (!activeChat) return;
    const nextMsgs: ChatMessage[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages(nextMsgs);
    setError(null);
    setPending(true);
    try {
      const res = await postQuery({ question, session_id: sessionId });
      let sid = sessionId;
      if (res.session_id && res.session_id !== sessionId) {
        sid = res.session_id;
        setSessionId(res.session_id);
      }
      const aiMessage = responseToMessage(res);
      const withAi = [...nextMsgs, aiMessage];
      setMessages(withAi);
      persist(activeChat, {
        session_id: sid,
        messages: withAi,
        asked_smes: askedSmes,
      });
    } catch (err) {
      setMessages((prev) =>
        prev.length > 0 && prev[prev.length - 1]?.role === "user"
          ? prev.slice(0, -1)
          : prev,
      );
      setError(formatError(err));
    } finally {
      setPending(false);
    }
  }

  function onNewChat() {
    const id = newSessionId();
    const initial: PersistedChat = {
      session_id: id,
      messages: [],
      asked_smes: [],
      updatedAt: Date.now(),
    };
    setChatMap((prev) => {
      const merged = { ...prev, [id]: initial };
      saveChatMap(merged);
      return merged;
    });
    setActiveChat(id);
    setSessionId(id);
    setMessages([]);
    setAskedSmes(new Set());
    setError(null);
  }

  function onAskSme(sme: { name: string; email: string }) {
    if (!activeChat || askedSmes.has(sme.email)) return;
    const nextAsked = new Set(askedSmes).add(sme.email);
    setAskedSmes(nextAsked);

    const reply =
      SME_REPLIES[sme.email] ??
      `Thanks for reaching out. ${sme.name} will respond shortly with guidance on your question.`;

    setTimeout(() => {
      setMessages((m) => {
        const withSme: ChatMessage[] = [
          ...m,
          { role: "sme", sme_name: sme.name, content: reply },
        ];
        persist(activeChat, {
          session_id: sessionId,
          messages: withSme,
          asked_smes: nextAsked,
        });
        return withSme;
      });
    }, 1500);
  }

  if (!hydrated) {
    return (
      <div className="flex h-screen min-w-[1024px] items-center justify-center bg-page text-sm text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div
      className="flex h-screen min-w-[1024px] bg-page"
      data-session-id={sessionId}
    >
      <ChatSidebar
        sessions={sessions}
        activeId={activeChat}
        onSelect={selectChat}
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
            {pending && (
              <div className="text-xs text-muted">Thinking…</div>
            )}
            {error && (
              <div className="rounded-card border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]">
                {error}
              </div>
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

function formatError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.status ? `${err.message} (HTTP ${err.status})` : err.message;
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}
