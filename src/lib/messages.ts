import { getDbPool } from "@/lib/db";
import type { ChatMessage } from "@/lib/chat/socket-events";

type DbMessageRow = {
  id: string;
  guest_id: string;
  text: string;
  created_at: Date;
};

function rowToChatMessage(row: DbMessageRow): ChatMessage {
  return {
    id: row.id,
    guestId: row.guest_id,
    text: row.text,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getRecentMessages(limit: number) {
  const pool = getDbPool();
  const cappedLimit = Math.max(1, Math.min(limit, 50));

  const result = await pool.query<DbMessageRow>(
    `
      SELECT id, guest_id, text, created_at
      FROM messages
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [cappedLimit],
  );

  return result.rows.map(rowToChatMessage).reverse();
}

export async function insertMessage(args: { guestId: string; text: string }) {
  const pool = getDbPool();
  const result = await pool.query<DbMessageRow>(
    `
      INSERT INTO messages (guest_id, text)
      VALUES ($1, $2)
      RETURNING id, guest_id, text, created_at
    `,
    [args.guestId, args.text],
  );

  const row = result.rows[0];
  if (!row) throw new Error("Failed to insert message.");
  return rowToChatMessage(row);
}

