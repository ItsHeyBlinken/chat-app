# Active Context

## Current focus
Implementing the validation MVP:
- age gate (18+ checkbox) stored locally
- auto-generated guest ID stored locally
- global realtime chat with Socket.IO
- bootstrap last messages from Postgres
- rate limiting (anti-spam)

## Open questions (deferred)
- Consumer vs B2B vs embeddable direction
- Whether accounts or multi-room are needed
- If/when moderation tooling becomes necessary
- Whether to adopt an English profanity wordlist (e.g. LDNOOBW) and upgrade filtering to word-boundary + normalization to reduce false positives
- Handle/share detection strictness: consider relaxing so it only blocks when there is clear "contact intent" language (e.g. "add me", "dm me", "my ig is"), to reduce false positives while still preventing off-platform contact sharing

