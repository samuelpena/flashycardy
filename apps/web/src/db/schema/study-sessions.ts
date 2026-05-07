import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { cards } from "./cards";
import { decks } from "./decks";

export const studySessions = pgTable("study_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: uuid().notNull().unique().$defaultFn(() => uuidv7()),
  clerkUserId: varchar({ length: 255 }).notNull(),
  deckId: integer()
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  totalCards: integer().notNull(),
  correctCount: integer().notNull().default(0),
  incorrectCount: integer().notNull().default(0),
  completedAt: timestamp().notNull().defaultNow(),
});

export const studySessionCards = pgTable("study_session_cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: uuid().notNull().unique().$defaultFn(() => uuidv7()),
  sessionId: integer()
    .notNull()
    .references(() => studySessions.id, { onDelete: "cascade" }),
  // nullable so card-level history survives if the card is later deleted
  cardId: integer().references(() => cards.id, { onDelete: "set null" }),
  isCorrect: boolean().notNull(),
});
