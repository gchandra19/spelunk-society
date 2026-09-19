import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

type Db = ReturnType<typeof create>;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle(new Pool({ connectionString: url, max: 5 }), { schema });
}

// Lazy singleton: survives hot reload in dev and is created only on first query (safe during build).
const g = globalThis as unknown as { __db?: Db };
export const getDb = (): Db => (g.__db ??= create());

export * as tables from "./schema";
