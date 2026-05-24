export type PaginationMeta = {
  total_items: number;
  per_page: number;
  total_pages: number;
  current_page: number;
};

export type PaginationLinks = {
  next: string | null;
  prev: string | null;
  first: string;
  last: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
};

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type Deck = {
  id: number;
  uuid: string;
  clerkUserId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Card = {
  id: number;
  uuid: string;
  deckId: number;
  front: string;
  back: string;
  createdAt: string;
  updatedAt: string;
};

export type DeckWithCards = Deck & {
  cards: Card[];
};

export type DeckCount = {
  count: number;
};

export type RatingAggregate = {
  cardUuid: string;
  correctCount: number;
  incorrectCount: number;
};

export type StudySessionCardResult = {
  cardUuid: string;
  isCorrect: boolean;
};

export type CreateStudySessionInput = {
  deckUuid: string;
  cardResults: StudySessionCardResult[];
};

export type CreateDeckInput = {
  name: string;
  description?: string;
  cards?: { front: string; back: string }[];
};

export type CreateDeckFromDocumentInput = {
  fileBase64: string;
  fileName: string;
};

export type CreateDeckFromPageInput = {
  pageText: string;
  pageUrl?: string;
  pageTitle?: string;
};

export type CreateCardInput = {
  front: string;
  back: string;
};

export type ReplaceDeckInput = {
  name: string;
  description?: string | null;
};

export type PatchDeckInput = {
  name?: string;
  description?: string | null;
};

export type ReplaceCardInput = {
  front: string;
  back: string;
};

export type PatchCardInput = {
  front?: string;
  back?: string;
};

export type StudySessionCountByDeck = {
  deckUuid: string;
  sessionCount: number;
};
