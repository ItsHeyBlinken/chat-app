# System Patterns

## App shape
- Single Next.js app (App Router)
- Custom Node server runs Next.js + Socket.IO in one process (`server.ts`)

## Realtime contract
- Socket.IO events: `chat:join`, `chat:send_message`, `chat:bootstrap`, `chat:new_message`, `chat:error`

## Data model
- `messages` table only for MVP
- Server bootstraps last 20–50 messages on join

