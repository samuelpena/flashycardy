export * from "./decks";
export * from "./cards";
export * from "./study-sessions";

import { relations } from "drizzle-orm";
import { cards } from "./cards";
import { decks } from "./decks";
import { studySessionCards, studySessions } from "./study-sessions";

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
