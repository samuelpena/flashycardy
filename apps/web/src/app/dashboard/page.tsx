import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { getDecksByUser } from "@/db/queries/decks";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { LayersIcon, BookOpenIcon, BarChart2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { DashboardTour } from "@/components/dashboard-tour";
import { DeckSortSelect, type DeckSortOption } from "./deck-sort-select";
import { EditDeckDialog } from "./edit-deck-dialog";
import { DeleteDeckDialog } from "./delete-deck-dialog";
import { getStudySessionCountsByUser } from "@/db/queries/study-sessions";

const FREE_DECK_LIMIT = 3;
const PAGE_SIZE = 9;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { userId, has } = await auth();
  if (!userId) redirect("/");

  const t = await getTranslations("Dashboard");
  const tCommon = await getTranslations("Common");
  const format = await getFormatter();
  const locale = await getLocale();

  const { page: pageParam, sort: rawSort } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const sort: DeckSortOption =
    rawSort === "az" || rawSort === "za" ? rawSort : "updated";

  const [userDecks, sessionCountRows] = await Promise.all([
    getDecksByUser(userId),
    getStudySessionCountsByUser(userId),
  ]);

  const sessionCounts = new Map(
    sessionCountRows.map((r) => [r.deckUuid, r.sessionCount]),
  );

  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const canGenerateDeckFromDocument = has({
    feature: "document_deck_generation",
  });
  const limitReached = !hasUnlimitedDecks && userDecks.length >= FREE_DECK_LIMIT;

  const sortedDecks = [...userDecks].sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name, locale);
    if (sort === "za") return b.name.localeCompare(a.name, locale);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(sortedDecks.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDecks = sortedDecks.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const showPagination = sortedDecks.length > PAGE_SIZE;

  function buildPageHref(p: number) {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (sort !== "updated") params.set("sort", sort);
    return `/dashboard?${params.toString()}`;
  }

  function getPageNumbers(
    current: number,
    total: number,
  ): (number | "ellipsis")[] {
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

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      <DashboardTour />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {t("subtitle")}
            {!hasUnlimitedDecks && (
              <span className="ml-2 text-xs">
                {tCommon("deckLimitBanner", {
                  used: userDecks.length,
                  limit: FREE_DECK_LIMIT,
                })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:shrink-0">
          {userDecks.length > 0 && <DeckSortSelect currentSort={sort} />}
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/analytics" />}
          >
            <BarChart2Icon className="size-4" />
            {t("analytics")}
          </Button>
          <CreateDeckDialog
            limitReached={limitReached}
            triggerId="new-deck-btn"
            canGenerateDeckFromDocument={canGenerateDeckFromDocument}
          />
        </div>
      </div>

      {userDecks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <LayersIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">{t("emptyTitle")}</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("emptyDescription")}
            </p>
          </div>
          <CreateDeckDialog
            emptyStateTrigger
            limitReached={limitReached}
            canGenerateDeckFromDocument={canGenerateDeckFromDocument}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedDecks.map((deck) => (
              <Card
                key={deck.uuid}
                className="relative flex flex-col hover:border-primary/50 transition-colors cursor-pointer"
              >
                <Link
                  href={`/decks/${deck.uuid}`}
                  className="absolute inset-0 rounded-xl"
                  aria-label={tCommon("openDeckAria", { name: deck.name })}
                />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t("nameHeader")}
                      </CardTitle>
                      <p className="text-sm font-medium leading-snug line-clamp-2 h-[2.625rem]">
                        {deck.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="relative z-10 shrink-0">
                      {tCommon("cardCount", { count: deck.cardCount })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 pt-0">
                  <div className="h-px w-full bg-border" />
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("descriptionHeader")}
                  </p>
                  <p className="text-sm text-muted-foreground leading-snug line-clamp-3 h-[3.8rem]">
                    {deck.description ?? ""}
                  </p>
                </CardContent>
                <CardFooter className="relative z-10 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground">
                      {tCommon("updatedLabel", {
                        date: format.dateTime(deck.updatedAt, {
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
                  <div className="flex items-center gap-0.5">
                    <EditDeckDialog
                      deckUuid={deck.uuid}
                      initialName={deck.name}
                      initialDescription={deck.description}
                    />
                    <DeleteDeckDialog
                      deckUuid={deck.uuid}
                      deckName={deck.name}
                      cardCount={deck.cardCount}
                    />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {showPagination && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={buildPageHref(safePage - 1)}
                    aria-disabled={safePage === 1}
                    className={
                      safePage === 1 ? "pointer-events-none opacity-50" : ""
                    }
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
                        href={buildPageHref(item)}
                        isActive={item === safePage}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href={buildPageHref(safePage + 1)}
                    aria-disabled={safePage === totalPages}
                    className={
                      safePage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </main>
  );
}
