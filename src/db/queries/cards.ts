import { db } from "@/db";
import { cards } from "@/db/schema";

export async function insertCard(values: typeof cards.$inferInsert) {
  return db.insert(cards).values(values).returning();
}
