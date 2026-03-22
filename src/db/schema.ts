import {
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

export const decksRelations = relations(decks, ({ many }) => ({
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
}));
