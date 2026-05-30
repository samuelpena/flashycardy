"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Deck } from "@flashycardy/api-client";
import { Protect } from "@clerk/chrome-extension";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Link, useSearchParams } from "react-router-dom";
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
import { DeckSortSelect, type DeckSortOption } from "@flashycardy/features";
import { BarChart2Icon, BookOpenIcon, LayersIcon } from "lucide-react";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { DeleteDeckDialog } from "@/components/delete-deck-dialog";
import { fetchAllPages } from "@/lib/fetch-all-pages";
import { useApi } from "@/lib/api-provider";

const FREE_DECK_LIMIT = 3;
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

export function DashboardScreen() {
  const api = useApi();
  const t = useTranslations("Dashboard");
  const tDeck = useTranslations("DeckDetail");
  const tCommon = useTranslations("Common");
  const tExt = useTranslations("Extension");
  const format = useFormatter();
  const locale = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [sessionCounts, setSessionCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const sort: DeckSortOption =
    searchParams.get("sort") === "az" || searchParams.get("sort") === "za"
      ? (searchParams.get("sort") as DeckSortOption)
      : "updated";
  const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const [allDecks, counts] = await Promise.all([
          fetchAllPages((p) => api.decks.list(p)),
          fetchAllPages((p) => api.studySessions.listCountsByDeck(p)),
        ]);
        if (cancelled) return;
        setDecks(allDecks);
        setSessionCounts(new Map(counts.map((c) => [c.deckUuid, c.sessionCount])));
      } catch {
        if (!cancelled) setError(tCommon("tryAgain"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, reloadToken, tCommon]);

  const sortedDecks = useMemo(() => {
    return [...decks].sort((a, b) => {
      if (sort === "az") return a.name.localeCompare(b.name, locale);
      if (sort === "za") return b.name.localeCompare(a.name, locale);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [decks, sort, locale]);

  const totalPages = Math.max(1, Math.ceil(sortedDecks.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDecks = sortedDecks.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function setSort(next: DeckSortOption) {
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

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {t("subtitle")}
            <Protect
              feature="unlimited_decks"
              fallback={
                <span className="ml-2 text-xs">
                  {tCommon("deckLimitBanner", {
                    used: decks.length,
                    limit: FREE_DECK_LIMIT,
                  })}
                </span>
              }
            >
              <span />
            </Protect>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {decks.length > 0 && (
            <DeckSortSelect currentSort={sort} onSortChange={setSort} />
          )}
          <Button variant="outline" nativeButton={false} render={<Link to="/analytics" />}>
            <BarChart2Icon className="size-4" />
            {t("analytics")}
          </Button>
          <CreateDeckDialog deckCount={decks.length} triggerId="new-deck-btn" onCreated={reload} />
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <LayersIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">{t("emptyTitle")}</p>
            <p className="max-w-xs text-sm text-muted-foreground">{t("emptyDescription")}</p>
          </div>
          <CreateDeckDialog deckCount={0} emptyStateTrigger onCreated={reload} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedDecks.map((deck) => (
              <Card key={deck.uuid} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t("nameHeader")}
                      </CardTitle>
                      <p className="line-clamp-2 h-[2.625rem] text-sm font-medium leading-snug">
                        <Link to={`/decks/${deck.uuid}`} className="hover:underline">
                          {deck.name}
                        </Link>
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <EditDeckDialog
                        deckUuid={deck.uuid}
                        initialName={deck.name}
                        initialDescription={deck.description}
                        onUpdated={reload}
                      />
                      <DeleteDeckDialog
                        deckUuid={deck.uuid}
                        deckName={deck.name}
                        cardCount={0}
                        onDeleted={reload}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 pt-0">
                  <div className="h-px w-full bg-border" />
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("descriptionHeader")}
                  </p>
                  <p className="line-clamp-3 h-[3.8rem] text-sm leading-snug text-muted-foreground">
                    {deck.description ?? ""}
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground">
                      {tCommon("updatedLabel", {
                        date: format.dateTime(new Date(deck.updatedAt), {
                          dateStyle: "medium",
                        }),
                      })}
                    </p>
                    {(sessionCounts.get(deck.uuid) ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpenIcon className="size-3" />
                        {sessionCounts.get(deck.uuid)}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    nativeButton={false}
                    render={<Link to={`/decks/${deck.uuid}/study`} />}
                  >
                    {tDeck("study")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {sortedDecks.length > PAGE_SIZE && (
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
