import { Pool } from "pg";

let pool: Pool | null = null;

export function getDbPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to connect to Postgres.");
  }

  pool = new Pool({ connectionString });
  return pool;
}

