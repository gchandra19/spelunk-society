import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";

/**
 * Fixed-window limiter backed by Postgres (one atomic upsert, no extra service needed).
 * Returns true if the call is allowed, false if `key` exceeded `limit` within `windowSec`.
 */
export async function allow(key: string, limit: number, windowSec: number): Promise<boolean> {
  const result = await getDb().execute<{ count: number }>(sql`
    INSERT INTO rate_limits (key, count, window_start)
    VALUES (${key}, 1, now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSec}) THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSec}) THEN now() ELSE rate_limits.window_start END
    RETURNING count
  `);
  return Number(result.rows[0]?.count ?? 1) <= limit;
}
