export const SOCKET_EVENTS = {
  join: "chat:join",
  sendMessage: "chat:send_message",
  bootstrap: "chat:bootstrap",
  newMessage: "chat:new_message",
  error: "chat:error",
} as const;

export type ChatErrorCode = "INVALID_MESSAGE" | "RATE_LIMITED" | "NOT_AGE_CONFIRMED";

export type ChatMessage = {
  id: string;
  guestId: string;
  text: string;
  createdAt: string;
};

export type JoinPayload = { guestId: string };
export type SendMessagePayload = { guestId: string; text: string };
export type BootstrapPayload = { messages: ChatMessage[] };
export type NewMessagePayload = { message: ChatMessage };
export type ChatErrorPayload = { code: ChatErrorCode; message: string };

