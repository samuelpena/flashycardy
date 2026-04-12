import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const decks = pgTable("decks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkUserId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const cards = pgTable("cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer()
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  front: text().notNull(),
  back: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
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
  sessionId: integer()
    .notNull()
    .references(() => studySessions.id, { onDelete: "cascade" }),
  // nullable so card-level history survives if the card is later deleted
  cardId: integer().references(() => cards.id, { onDelete: "set null" }),
  isCorrect: boolean().notNull(),
});

export const decksRelations = relations(decks, ({ many }) => ({
  cards: many(cards),
  studySessions: many(studySessions),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
  studySessionCards: many(studySessionCards),
}));

export const studySessionsRelations = relations(
  studySessions,
  ({ one, many }) => ({
    deck: one(decks, {
      fields: [studySessions.deckId],
      references: [decks.id],
    }),
    sessionCards: many(studySessionCards),
  })
);

export const studySessionCardsRelations = relations(
  studySessionCards,
  ({ one }) => ({
    session: one(studySessions, {
      fields: [studySessionCards.sessionId],
      references: [studySessions.id],
    }),
    card: one(cards, {
      fields: [studySessionCards.cardId],
      references: [cards.id],
    }),
  })
);
