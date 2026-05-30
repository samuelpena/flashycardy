"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Card as Flashcard, DeckWithCards, RatingAggregate } from "@flashycardy/api-client";
import { useLocale, useTranslations } from "next-intl";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@flashycardy/ui/card";
import { Badge } from "@flashycardy/ui/badge";
import { Button } from "@flashycardy/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@flashycardy/ui/pagination";
import { CardSortSelect, type CardSortOption } from "@flashycardy/features";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  LayersIcon,
  PlusIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { AddCardDialog } from "@/components/add-card-dialog";
import { DeleteCardDialog } from "@/components/delete-card-dialog";
import { DeleteDeckDialog } from "@/components/delete-deck-dialog";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { GenerateCardsButton } from "@/components/generate-cards-button";
import { fetchAllPages } from "@/lib/fetch-all-pages";
import { useApi } from "@/lib/api-provider";

const PAGE_SIZE = 9;

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function DeckDetailScreen() {
  const { deckUuid = "" } = useParams<{ deckUuid: string }>();
  const api = useApi();
  const t = useTranslations("DeckDetail");
  const tCommon = useTranslations("Common");
  const tExt = useTranslations("Extension");
  const locale = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();

  const [deck, setDeck] = useState<DeckWithCards | null>(null);
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [ratings, setRatings] = useState<Map<string, RatingAggregate>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const sort: CardSortOption =
    searchParams.get("sort") === "az" || searchParams.get("sort") === "za"
      ? (searchParams.get("sort") as CardSortOption)
      : "updated";
  const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    if (!deckUuid) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const [firstPage, ratingRows] = await Promise.all([
          api.decks.get(deckUuid, { page: 1, pageSize: 100 }),
          fetchAllPages((p) => api.cards.listRatings(deckUuid, p)),
        ]);
        if (cancelled) return;

        let cards = firstPage.data.cards;
        if (firstPage.meta.total_pages > 1) {
          const extra = await Promise.all(
            Array.from({ length: firstPage.meta.total_pages - 1 }, (_, i) =>
              api.decks.get(deckUuid, { page: i + 2, pageSize: 100 }),
            ),
          );
          cards = cards.concat(...extra.map((r) => r.data.cards));
        }

        const { cards: _c, ...meta } = firstPage.data;
        setDeck({ ...meta, cards: [] });
        setAllCards(cards);
        setRatings(
          new Map(ratingRows.map((r) => [r.cardUuid, r])),
        );
      } catch {
        if (!cancelled) setError(tCommon("tryAgain"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, deckUuid, reloadToken, tCommon]);

  const sortedCards = useMemo(() => {
    return [...allCards].sort((a, b) => {
      if (sort === "az") return a.front.localeCompare(b.front, locale);
      if (sort === "za") return b.front.localeCompare(a.front, locale);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [allCards, sort, locale]);

  const totalPages = Math.max(1, Math.ceil(sortedCards.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCards = sortedCards.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function setSort(next: CardSortOption) {
    const params = new URLSearchParams(searchParams);
    if (next === "updated") params.delete("sort");
    else params.set("sort", next);
    params.delete("page");
    setSearchParams(params);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">{tExt("loading")}</p>;
  }

  if (error || !deck) {
    return <p className="text-sm text-destructive">{error ?? tCommon("tryAgain")}</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          to="/dashboard"
          className="mb-1 flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          {t("backToDecks")}
        </Link>
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
              {deck.name}
            </h1>
            <Badge variant="secondary">
              {tCommon("cardCount", { count: allCards.length })}
            </Badge>
          </div>
          {deck.description && (
            <p className="text-sm text-muted-foreground sm:text-base">{deck.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              nativeButton={false}
              render={<Link to={`/decks/${deckUuid}/study`} />}
            >
              <BookOpenIcon className="size-4" />
              {t("study")}
            </Button>
            <GenerateCardsButton
              deckUuid={deck.uuid}
              hasDescription={!!deck.description}
              onGenerated={reload}
            />
            <AddCardDialog deckUuid={deck.uuid} onAdded={reload} />
            <EditDeckDialog
              deckUuid={deck.uuid}
              initialName={deck.name}
              initialDescription={deck.description}
              triggerVariant="outline"
              onUpdated={reload}
            />
            <DeleteDeckDialog
              deckUuid={deck.uuid}
              deckName={deck.name}
              cardCount={allCards.length}
              triggerVariant="outline"
              redirectAfterDelete
            />
            {allCards.length > 0 && (
              <CardSortSelect currentSort={sort} onSortChange={setSort} />
            )}
          </div>
        </div>
      </div>

      {allCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <LayersIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">{t("emptyCardsTitle")}</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {t("emptyCardsDescription")}
            </p>
          </div>
          <AddCardDialog
            deckUuid={deck.uuid}
            onAdded={reload}
            trigger={
              <Button>
                <PlusIcon className="size-4" />
                {t("addFirstCard")}
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedCards.map((card) => {
              const rating = ratings.get(card.uuid);
              return (
                <Card key={card.uuid} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t("fieldFront")}
                    </CardTitle>
                    <p className="line-clamp-2 h-[2.625rem] text-sm font-medium leading-snug">
                      {card.front}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 pt-0">
                    <div className="h-px w-full bg-border" />
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t("fieldBack")}
                    </p>
                    <p className="line-clamp-3 h-[3.8rem] text-sm leading-snug text-muted-foreground">
                      {card.back}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-between gap-1 pt-4">
                    {rating ? (
                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUpIcon className="size-3 text-green-500" />
                          {rating.correctCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsDownIcon className="size-3 text-red-400" />
                          {rating.incorrectCount}
                        </span>
                      </div>
                    ) : (
                      <span />
                    )}
                    <div className="flex gap-1">
                      <DeleteCardDialog
                        cardUuid={card.uuid}
                        deckUuid={deck.uuid}
                        onDeleted={reload}
                      />
                      <EditCardDialog
                        cardUuid={card.uuid}
                        deckUuid={deck.uuid}
                        initialFront={card.front}
                        initialBack={card.back}
                        onUpdated={reload}
                      />
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {sortedCards.length > PAGE_SIZE && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (safePage > 1) goToPage(safePage - 1);
                    }}
                    aria-disabled={safePage === 1}
                    className={safePage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {getPageNumbers(safePage, totalPages).map((item, idx) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === safePage}
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(item);
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (safePage < totalPages) goToPage(safePage + 1);
                    }}
                    aria-disabled={safePage === totalPages}
                    className={
                      safePage === totalPages ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
