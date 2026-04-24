# Progress

## 2026-04-24
- Scaffolded Next.js app in `chat-app/`
- Added `messages` schema in `db/schema.sql`
- Added guest ID + age gate local storage helpers
- Added Socket.IO server with join/bootstrap and send/broadcast flow
- Added minimal UI: age gate, global chat shell, message list/input, connection status
- Added `.env.example` and initialized Memory Bank files
- Added topics with DB `topic_slug` + topic picker
- Added retention pruning script (`scripts/prune-messages.js`) for VPS cron/scheduled job use
- Added server-side spam controls:
  - per-guest rate limiting
  - optional banned-words filtering (`BANNED_WORDS`)
  - link blocking (incl. common obfuscations)
  - social handle/contact blocking
  - strikes → mute → kick → temporary ban (in-memory)
- Hardened guest identity:
  - server enforcement uses an opaque session ID (UUID) stored in `sessionStorage`
  - UI displays `Guest####` label
  - DB stores both `guest_id` (opaque) and `guest_label` (display)
- Added `gaming` + `adult` topics
- Adult topic policy: skips banned-words filter only; still blocks links/handles and enforces rate-limit + strikes
- Added adult-topic consent step (extra checkbox) stored in `sessionStorage`
- Fixed false-positive filtering edge cases (e.g. “jiggle” triggering `ig` substring match)

