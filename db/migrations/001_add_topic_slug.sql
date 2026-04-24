ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS topic_slug TEXT NOT NULL DEFAULT 'tech';

CREATE INDEX IF NOT EXISTS messages_topic_created_at_idx
  ON messages (topic_slug, created_at DESC);

