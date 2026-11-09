// Applies migrations/*.sql in filename order, each exactly once, inside a
// transaction. This app lives in its own "luxe_layers" schema inside a
// shared Supabase project (isolated from Selmo's own "selmo" schema) — the
// schema is created here if missing, then every migration and the ledger
// table itself run against it via search_path.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

export async function migrate(connectionString: string, log = console.log) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query("CREATE SCHEMA IF NOT EXISTS luxe_layers");
    await client.query("SET search_path TO luxe_layers, public");
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    // Serialise concurrent deploys — a different lock id from Selmo's own
    // migrate.ts (727001), since both apps share this Postgres cluster.
    await client.query("SELECT pg_advisory_lock(727002)");
    const dir = path.resolve(import.meta.dirname, "../migrations");
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    const done = new Set((await client.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name));
    for (const file of files) {
      if (done.has(file)) continue;
      await client.query("BEGIN");
      try {
        await client.query(readFileSync(path.join(dir, file), "utf8"));
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        log(`applied ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`migration ${file} failed: ${err}`);
      }
    }
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  await migrate(url);
  console.log("migrations up to date");
}
