import "@dotenvx/dotenvx/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Adding uuid columns…");

  await sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "uuid" uuid`;
  await sql`ALTER TABLE "decks" ADD COLUMN IF NOT EXISTS "uuid" uuid`;
  await sql`ALTER TABLE "study_session_cards" ADD COLUMN IF NOT EXISTS "uuid" uuid`;
  await sql`ALTER TABLE "study_sessions" ADD COLUMN IF NOT EXISTS "uuid" uuid`;

  console.log("Backfilling existing rows…");

  await sql`UPDATE "cards" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL`;
  await sql`UPDATE "decks" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL`;
  await sql`UPDATE "study_session_cards" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL`;
  await sql`UPDATE "study_sessions" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL`;

  console.log("Setting NOT NULL…");

  await sql`ALTER TABLE "cards" ALTER COLUMN "uuid" SET NOT NULL`;
  await sql`ALTER TABLE "decks" ALTER COLUMN "uuid" SET NOT NULL`;
  await sql`ALTER TABLE "study_session_cards" ALTER COLUMN "uuid" SET NOT NULL`;
  await sql`ALTER TABLE "study_sessions" ALTER COLUMN "uuid" SET NOT NULL`;

  console.log("Adding UNIQUE constraints…");

  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cards_uuid_unique') THEN
        ALTER TABLE "cards" ADD CONSTRAINT "cards_uuid_unique" UNIQUE("uuid");
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'decks_uuid_unique') THEN
        ALTER TABLE "decks" ADD CONSTRAINT "decks_uuid_unique" UNIQUE("uuid");
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'study_session_cards_uuid_unique') THEN
        ALTER TABLE "study_session_cards" ADD CONSTRAINT "study_session_cards_uuid_unique" UNIQUE("uuid");
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'study_sessions_uuid_unique') THEN
        ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_uuid_unique" UNIQUE("uuid");
      END IF;
    END $$
  `;

  console.log("Done!");
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
