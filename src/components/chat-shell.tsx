"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ConnectionStatus } from "@/components/connection-status";
import { MessageInput } from "@/components/message-input";
import { MessageList } from "@/components/message-list";
import { disconnectSocket, getSocket } from "@/lib/chat/socket-client";
import { SOCKET_EVENTS } from "@/lib/chat/socket-events";
import type { BootstrapPayload, ChatErrorPayload, ChatMessage, NewMessagePayload } from "@/lib/chat/socket-events";
import { TOPICS } from "@/lib/topics";

export function ChatShell(props: { guestId: string; topic: string; onChangeTopic: () => void; onLogout: () => void }) {
  const socket = useMemo(() => getSocket(), []);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isNearBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFromBottom < 120;
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setStatus("connected");
      setError(null);
      socket.emit(SOCKET_EVENTS.join, { guestId: props.guestId, topic: props.topic });
    };

    const onDisconnect = () => setStatus("disconnected");

    const onBootstrap = (payload: BootstrapPayload) => {
      setMessages(payload.messages ?? []);
    };

    const onNewMessage = (payload: NewMessagePayload) => {
      const msg = payload.message;
      if (msg.topic !== props.topic) return;
      const shouldStick = isNearBottom();
      setMessages((prev) => {
        const next = [...prev, msg];
        return next.slice(-50);
      });
      if (shouldStick) scrollToBottom();
    };

    const onError = (payload: ChatErrorPayload) => {
      setError(payload.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(SOCKET_EVENTS.bootstrap, onBootstrap);
    socket.on(SOCKET_EVENTS.newMessage, onNewMessage);
    socket.on(SOCKET_EVENTS.error, onError);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(SOCKET_EVENTS.bootstrap, onBootstrap);
      socket.off(SOCKET_EVENTS.newMessage, onNewMessage);
      socket.off(SOCKET_EVENTS.error, onError);
    };
  }, [props.guestId, props.topic, socket]);

  useEffect(() => {
    // On first load (bootstrap), scroll to bottom once messages are rendered.
    if (messages.length === 0) return;
    scrollToBottom();
  }, [messages.length]);

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/50 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              {TOPICS.find((t) => t.slug === props.topic)?.name ?? "Chat"}
            </div>
            <div className="truncate text-xs text-white/60">You are {props.guestId}</div>
          </div>
          <div className="flex items-center gap-2">
            <ConnectionStatus status={status} />
            <button
              type="button"
              className="h-8 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/80 hover:bg-white/10"
              onClick={() => {
                disconnectSocket();
                props.onChangeTopic();
              }}
            >
              Topics
            </button>
            <button
              type="button"
              className="h-8 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/80 hover:bg-white/10"
              onClick={() => {
                disconnectSocket();
                props.onLogout();
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main
        ref={scrollContainerRef}
        className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-4"
      >
        <MessageList messages={messages} guestId={props.guestId} />
        <div ref={bottomRef} />
      </main>

      <footer className="border-t border-white/10 bg-black/50">
        <div className="mx-auto w-full max-w-2xl px-4 py-3">
          {error ? <div className="mb-2 text-xs text-rose-300">{error}</div> : null}
          <MessageInput
            disabled={status !== "connected"}
            onSend={(text) => {
              setError(null);
              socket?.emit(SOCKET_EVENTS.sendMessage, { guestId: props.guestId, topic: props.topic, text });
            }}
          />
        </div>
      </footer>
    </div>
  );
}

