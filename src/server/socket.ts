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
import { validateMessageText } from "@/lib/chat/message-validation";
import { createRateLimiter } from "@/lib/chat/rate-limit";
import { getRecentMessages, insertMessage } from "@/lib/messages";

const RECENT_MESSAGES_LIMIT = 50;
const MIN_MESSAGE_INTERVAL_MS = 1200;

export function registerSocketServer(server: HttpServer) {
  const io = new IOServer(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  const rateLimiter = createRateLimiter();
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  io.on("connection", (socket) => {
    socket.on(SOCKET_EVENTS.join, async (payload: JoinPayload) => {
      if (!payload?.guestId) return;

      try {
        const messages = hasDatabase ? await getRecentMessages(RECENT_MESSAGES_LIMIT) : [];
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
      if (!payload?.guestId) return;

      const validation = validateMessageText(payload.text);
      if (!validation.ok) {
        const err: ChatErrorPayload = { code: "INVALID_MESSAGE", message: validation.reason };
        socket.emit(SOCKET_EVENTS.error, err);
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
          ? await insertMessage({ guestId: payload.guestId, text: validation.text })
          : {
              id: randomUUID(),
              guestId: payload.guestId,
              text: validation.text,
              createdAt: new Date().toISOString(),
            };

        const newMessage: NewMessagePayload = { message };
        io.emit(SOCKET_EVENTS.newMessage, newMessage);
      } catch (err) {
        // If Postgres is down, still broadcast messages (they just won't persist).
        console.error("Failed to persist message, broadcasting anyway:", err);
        const newMessage: NewMessagePayload = {
          message: {
            id: randomUUID(),
            guestId: payload.guestId,
            text: validation.text,
            createdAt: new Date().toISOString(),
          },
        };
        io.emit(SOCKET_EVENTS.newMessage, newMessage);
      }
    });
  });
}

