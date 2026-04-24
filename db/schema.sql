CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT NOT NULL,
  guest_label TEXT NOT NULL,
  topic_slug TEXT NOT NULL DEFAULT 'tech',
  text TEXT NOT NULL CHECK (char_length(text) > 0 AND char_length(text) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_created_at_idx
  ON messages (created_at DESC);

CREATE INDEX IF NOT EXISTS messages_topic_created_at_idx
  ON messages (topic_slug, created_at DESC);

