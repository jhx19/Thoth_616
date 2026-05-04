"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // auto-resize up to 4 rows
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 22;
    const max = lineHeight * 4 + 16;
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [value]);

  function send() {
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setValue("");
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="border-t border-line bg-card px-6 py-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-card border border-line bg-card p-2 focus-within:border-magenta focus-within:ring-2 focus-within:ring-magenta/20">
          <Textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask about MEZ compliance, digital assets, dispute resolution…"
            rows={1}
            className="border-0 focus:ring-0 focus:border-0 px-2 py-1.5 leading-[22px]"
          />
          <Button
            variant="primary"
            size="icon"
            onClick={send}
            aria-label="Send"
            className="shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">
          Enter to send · Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
