import { getDbPool } from "@/lib/db";
import type { ChatMessage } from "@/lib/chat/socket-events";

type DbMessageRow = {
  id: string;
  guest_id: string;
  guest_label: string;
  topic_slug: string;
  text: string;
  created_at: Date;
};

function rowToChatMessage(row: DbMessageRow): ChatMessage {
  return {
    id: row.id,
    guestId: row.guest_id,
    guestLabel: row.guest_label,
    topic: row.topic_slug,
    text: row.text,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getRecentMessages(args: { topic: string; limit: number }) {
  const pool = getDbPool();
  const cappedLimit = Math.max(1, Math.min(args.limit, 50));

  const result = await pool.query<DbMessageRow>(
    `
      SELECT id, guest_id, guest_label, topic_slug, text, created_at
      FROM messages
      WHERE topic_slug = $1
      ORDER BY created_at DESC
      LIMIT $2
    `,
    [args.topic, cappedLimit],
  );

  return result.rows.map(rowToChatMessage).reverse();
}

export async function insertMessage(args: { guestId: string; guestLabel: string; topic: string; text: string }) {
  const pool = getDbPool();
  const result = await pool.query<DbMessageRow>(
    `
      INSERT INTO messages (guest_id, guest_label, topic_slug, text)
      VALUES ($1, $2, $3, $4)
      RETURNING id, guest_id, guest_label, topic_slug, text, created_at
    `,
    [args.guestId, args.guestLabel, args.topic, args.text],
  );

  const row = result.rows[0];
  if (!row) throw new Error("Failed to insert message.");
  return rowToChatMessage(row);
}

