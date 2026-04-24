"use client";

import type { ChatMessage } from "@/lib/chat/socket-events";

export function MessageList(props: { messages: ChatMessage[]; guestId: string }) {
  return (
    <div className="flex flex-col gap-3">
      {props.messages.map((m) => {
        const mine = m.guestId === props.guestId;
        return (
          <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={[
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                mine ? "bg-white/15 text-white" : "bg-white/5 text-white",
              ].join(" ")}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className={`text-xs ${mine ? "text-white/80" : "text-white/60"}`}>
                  {m.guestLabel}
                </span>
                <span className={`text-[11px] ${mine ? "text-white/60" : "text-white/45"}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="mt-1 whitespace-pre-wrap break-words">{m.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

