ALTER TABLE "cards" ADD COLUMN "uuid" uuid;--> statement-breakpoint
ALTER TABLE "decks" ADD COLUMN "uuid" uuid;--> statement-breakpoint
ALTER TABLE "study_session_cards" ADD COLUMN "uuid" uuid;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD COLUMN "uuid" uuid;--> statement-breakpoint
UPDATE "cards" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;--> statement-breakpoint
UPDATE "decks" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;--> statement-breakpoint
UPDATE "study_session_cards" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;--> statement-breakpoint
UPDATE "study_sessions" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "uuid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "decks" ALTER COLUMN "uuid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "study_session_cards" ALTER COLUMN "uuid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "study_sessions" ALTER COLUMN "uuid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_uuid_unique" UNIQUE("uuid");--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_uuid_unique" UNIQUE("uuid");--> statement-breakpoint
ALTER TABLE "study_session_cards" ADD CONSTRAINT "study_session_cards_uuid_unique" UNIQUE("uuid");--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_uuid_unique" UNIQUE("uuid");
