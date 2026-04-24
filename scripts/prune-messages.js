// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require("pg");

const retentionDays = Number(process.env.MESSAGE_RETENTION_DAYS || 7);
const batchSize = Number(process.env.MESSAGE_PRUNE_BATCH_SIZE || 5000);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

if (!Number.isFinite(retentionDays) || retentionDays <= 0) {
  console.error("MESSAGE_RETENTION_DAYS must be a positive number.");
  process.exit(1);
}

if (!Number.isFinite(batchSize) || batchSize <= 0) {
  console.error("MESSAGE_PRUNE_BATCH_SIZE must be a positive number.");
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(
      `
        WITH doomed AS (
          SELECT id
          FROM public.messages
          WHERE created_at < now() - ($1 || ' days')::interval
          ORDER BY created_at
          LIMIT $2
        )
        DELETE FROM public.messages m
        USING doomed
        WHERE m.id = doomed.id
        RETURNING m.id
      `,
      [String(retentionDays), batchSize],
    );

    console.log(
      JSON.stringify(
        {
          retentionDays,
          batchSize,
          deletedCount: result.rowCount || 0,
        },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

