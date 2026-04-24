import { Server as HttpServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server as IOServer } from "socket.io";

import { SOCKET_EVENTS } from "@/lib/chat/socket-events";
import type {
  BootstrapPayload,
  ChatErrorPayload,
  JoinPayload,
  NewMessagePayload,
  SendMessagePayload,
} from "@/lib/chat/socket-events";
import {
  containsBannedWord,
  containsHandleShareText,
  containsLinkLikeText,
  validateMessageText,
} from "@/lib/chat/message-validation";
import { createRateLimiter } from "@/lib/chat/rate-limit";
import { getRecentMessages, insertMessage } from "@/lib/messages";
import { DEFAULT_TOPIC_SLUG, getTopicBySlug, isValidTopicSlug } from "@/lib/topics";

const RECENT_MESSAGES_LIMIT = 50;
const MIN_MESSAGE_INTERVAL_MS = 1200;
const STRIKE_WINDOW_MS = 10 * 60 * 1000;
const MUTE_MS = 60 * 1000;
const BAN_MS = 15 * 60 * 1000;

type GuestDisciplineState = {
  windowStartedAtMs: number;
  strikes: number;
  mutedUntilMs: number;
  bannedUntilMs: number;
};

function parseCsvEnv(name: string) {
  const value = process.env[name];
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function registerSocketServer(server: HttpServer) {
  const io = new IOServer(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  const rateLimiter = createRateLimiter();
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const bannedWords = parseCsvEnv("BANNED_WORDS");
  const blockLinks = (process.env.BLOCK_LINKS ?? "true").toLowerCase() !== "false";
  const blockHandles = (process.env.BLOCK_HANDLES ?? "true").toLowerCase() !== "false";
  const handleKeywords = parseCsvEnv("HANDLE_KEYWORDS");
  const disciplineByGuestId = new Map<string, GuestDisciplineState>();

  const getState = (guestId: string) => {
    const now = Date.now();
    const existing = disciplineByGuestId.get(guestId);
    if (!existing) {
      const created: GuestDisciplineState = {
        windowStartedAtMs: now,
        strikes: 0,
        mutedUntilMs: 0,
        bannedUntilMs: 0,
      };
      disciplineByGuestId.set(guestId, created);
      return created;
    }

    if (now - existing.windowStartedAtMs > STRIKE_WINDOW_MS) {
      existing.windowStartedAtMs = now;
      existing.strikes = 0;
    }

    return existing;
  };

  const isMutedOrBanned = (guestId: string) => {
    const now = Date.now();
    const state = getState(guestId);
    if (state.bannedUntilMs > now) return { status: "banned" as const, untilMs: state.bannedUntilMs };
    if (state.mutedUntilMs > now) return { status: "muted" as const, untilMs: state.mutedUntilMs };
    return null;
  };

  const applyViolation = (guestId: string, socket: import("socket.io").Socket) => {
    const now = Date.now();
    const state = getState(guestId);
    state.strikes += 1;

    if (state.strikes === 1) {
      const err: ChatErrorPayload = {
        code: "INVALID_MESSAGE",
        message: "Message blocked. Repeated violations will result in a mute/ban.",
      };
      socket.emit(SOCKET_EVENTS.error, err);
      return;
    }

    if (state.strikes === 2) {
      state.mutedUntilMs = Math.max(state.mutedUntilMs, now + MUTE_MS);
      const err: ChatErrorPayload = {
        code: "MUTED",
        message: "You are muted for 60 seconds due to repeated violations.",
      };
      socket.emit(SOCKET_EVENTS.error, err);
      return;
    }

    if (state.strikes === 3) {
      state.mutedUntilMs = Math.max(state.mutedUntilMs, now + 5 * 60 * 1000);
      socket.emit(SOCKET_EVENTS.kicked, { message: "You were logged out for repeated violations." });
      socket.disconnect(true);
      return;
    }

    state.bannedUntilMs = Math.max(state.bannedUntilMs, now + BAN_MS);
    socket.emit(SOCKET_EVENTS.kicked, { message: "You were temporarily banned for repeated violations." });
    socket.disconnect(true);
  };

  io.on("connection", (socket) => {
    socket.on(SOCKET_EVENTS.join, async (payload: JoinPayload) => {
      if (!payload?.guestId || !payload?.guestLabel) return;
      const topic = isValidTopicSlug(payload.topic) ? payload.topic : DEFAULT_TOPIC_SLUG;

      const blocked = isMutedOrBanned(payload.guestId);
      if (blocked?.status === "banned") {
        const err: ChatErrorPayload = { code: "BANNED", message: "You are temporarily banned." };
        socket.emit(SOCKET_EVENTS.error, err);
        socket.disconnect(true);
        return;
      }

      socket.join(topic);

      try {
        const messages = hasDatabase ? await getRecentMessages({ topic, limit: RECENT_MESSAGES_LIMIT }) : [];
        const bootstrap: BootstrapPayload = { messages };
        socket.emit(SOCKET_EVENTS.bootstrap, bootstrap);
      } catch (err) {
        // If Postgres is misconfigured or temporarily down, the chat should still work.
        console.error("Failed to load recent messages:", err);
        const bootstrap: BootstrapPayload = { messages: [] };
        socket.emit(SOCKET_EVENTS.bootstrap, bootstrap);
      }
    });

    socket.on(SOCKET_EVENTS.sendMessage, async (payload: SendMessagePayload) => {
      if (!payload?.guestId || !payload?.guestLabel) return;
      const topic = isValidTopicSlug(payload.topic) ? payload.topic : DEFAULT_TOPIC_SLUG;

      const blocked = isMutedOrBanned(payload.guestId);
      if (blocked?.status === "banned") {
        const err: ChatErrorPayload = { code: "BANNED", message: "You are temporarily banned." };
        socket.emit(SOCKET_EVENTS.error, err);
        return;
      }
      if (blocked?.status === "muted") {
        const err: ChatErrorPayload = { code: "MUTED", message: "You are muted. Try again shortly." };
        socket.emit(SOCKET_EVENTS.error, err);
        return;
      }

      const validation = validateMessageText(payload.text);
      if (!validation.ok) {
        const err: ChatErrorPayload = { code: "INVALID_MESSAGE", message: validation.reason };
        socket.emit(SOCKET_EVENTS.error, err);
        return;
      }

      const topicPolicy = getTopicBySlug(topic);
      const bannedWordsEnabled = topicPolicy?.bannedWordsEnabled ?? true;

      if (bannedWordsEnabled && bannedWords.length > 0 && containsBannedWord(validation.text, bannedWords)) {
        applyViolation(payload.guestId, socket);
        return;
      }

      if (blockLinks && containsLinkLikeText(validation.text)) {
        applyViolation(payload.guestId, socket);
        return;
      }

      if (blockHandles && containsHandleShareText(validation.text, handleKeywords)) {
        applyViolation(payload.guestId, socket);
        return;
      }

      if (!rateLimiter.allowMessage(payload.guestId, MIN_MESSAGE_INTERVAL_MS)) {
        const err: ChatErrorPayload = {
          code: "RATE_LIMITED",
          message: "You're sending messages too fast. Slow down a bit.",
        };
        socket.emit(SOCKET_EVENTS.error, err);
        return;
      }

      try {
        const message = hasDatabase
          ? await insertMessage({
              guestId: payload.guestId,
              guestLabel: payload.guestLabel,
              topic,
              text: validation.text,
            })
          : {
              id: randomUUID(),
              guestId: payload.guestId,
              guestLabel: payload.guestLabel,
              topic,
              text: validation.text,
              createdAt: new Date().toISOString(),
            };

        const newMessage: NewMessagePayload = { message };
        io.to(topic).emit(SOCKET_EVENTS.newMessage, newMessage);
      } catch (err) {
        // If Postgres is down, still broadcast messages (they just won't persist).
        console.error("Failed to persist message, broadcasting anyway:", err);
        const newMessage: NewMessagePayload = {
          message: {
            id: randomUUID(),
            guestId: payload.guestId,
            guestLabel: payload.guestLabel,
            topic,
            text: validation.text,
            createdAt: new Date().toISOString(),
          },
        };
        io.to(topic).emit(SOCKET_EVENTS.newMessage, newMessage);
      }
    });
  });
}

