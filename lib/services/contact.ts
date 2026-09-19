import { desc } from "drizzle-orm";
import { getDb, tables } from "@/lib/db";
import type { ContactMessage } from "@/types/domain";

export async function saveContactMessage(input: { name: string; email: string; message: string; userId: string | null }): Promise<void> {
  await getDb().insert(tables.contactMessages).values(input);
}

export async function listContactMessages(limit = 100): Promise<ContactMessage[]> {
  const rows = await getDb().select().from(tables.contactMessages).orderBy(desc(tables.contactMessages.createdAt)).limit(limit);
  return rows.map((r) => ({ id: r.id, name: r.name, email: r.email, message: r.message, createdAt: r.createdAt.toISOString() }));
}
