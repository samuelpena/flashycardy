import { z } from "zod";

/** Shared GPT output shape for document and page-content deck generation. */
export const deckFromContentOutputSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000),
  cards: z
    .array(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1),
      }),
    )
    .length(20),
});

export type DeckFromContentOutput = z.infer<typeof deckFromContentOutputSchema>;
