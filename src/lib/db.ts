import pg from "pg";
import { env } from "./env";

// Postgres returns BIGINT (int8) as a string. All our BIGINTs are kobo
// amounts, which fit safely in a JS number; refuse anything that doesn't
// rather than lose precision.
pg.types.setTypeParser(20, (value) => {
  const n = Number(value);
  if (!Number.isSafeInteger(n)) throw new Error(`BIGINT ${value} exceeds safe integer range`);
  return n;
});

const globalForPool = globalThis as unknown as { luxeLayersPool?: pg.Pool };

function pool(): pg.Pool {
  globalForPool.luxeLayersPool ??= new pg.Pool({
    connectionString: env().DATABASE_URL,
    max: process.env.VERCEL ? 3 : 10,
    idleTimeoutMillis: process.env.VERCEL ? 10_000 : 30_000,
    // This app lives in its own schema inside a shared Supabase project
    // (isolated from Selmo's own "selmo" schema) — every connection needs
    // its search_path set, since nothing at the connection-string level
    // sticks to a non-default schema through a pooler.
    options: "-c search_path=luxe_layers,public",
  });
  return globalForPool.luxeLayersPool;
}

export type Queryable = Pick<pg.PoolClient, "query">;

export async function query<T extends pg.QueryResultRow>(
  sql: string,
  params: unknown[] = [],
  client: Queryable = pool(),
): Promise<T[]> {
  const res = await client.query<T>(sql, params);
  return res.rows;
}

export async function queryOne<T extends pg.QueryResultRow>(
  sql: string,
  params: unknown[] = [],
  client: Queryable = pool(),
): Promise<T | undefined> {
  const rows = await query<T>(sql, params, client);
  return rows[0];
}

/** Runs fn inside a transaction; rolls back on any thrown error. */
export async function tx<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // connection is already broken — nothing to roll back
    }
    throw err;
  } finally {
    client.release();
  }
}
