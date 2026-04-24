# Tech Context

## Stack
- Next.js + React + TypeScript + Tailwind
- Socket.IO for realtime messaging
- PostgreSQL for persisting recent messages
- `pg` Pool for DB access

## Local environment
- Configure `DATABASE_URL` in `.env.local` (see `.env.example`)
- Run schema in `db/schema.sql` against your Postgres instance

## Topics (DB slugs)
These values are used as `messages.topic_slug`:
- `tech`
- `gaming`
- `fitness`
- `dating`
- `money`
- `adult`
- `random`

## Ex.
## DELETE FROM public.messages
## WHERE topic_slug = 'gaming';
