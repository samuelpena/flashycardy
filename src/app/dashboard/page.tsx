import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDecksByUser } from "@/db/queries/decks";
import {
  Card,
  CardDescription,
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
import { LayersIcon } from "lucide-react";
import Link from "next/link";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { DeckSortSelect, type DeckSortOption } from "./deck-sort-select";
import { EditDeckDialog } from "./edit-deck-dialog";
import { DeleteDeckDialog } from "./delete-deck-dialog";

const FREE_DECK_LIMIT = 3;
const PAGE_SIZE = 9;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { userId, has } = await auth();
  if (!userId) redirect("/");

  const { page: pageParam, sort: rawSort } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const sort: DeckSortOption =
    rawSort === "az" || rawSort === "za" ? rawSort : "updated";

  const userDecks = await getDecksByUser(userId);
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const limitReached = !hasUnlimitedDecks && userDecks.length >= FREE_DECK_LIMIT;

  const sortedDecks = [...userDecks].sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name);
    if (sort === "za") return b.name.localeCompare(a.name);
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

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Decks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and study your flashcard decks.
            {!hasUnlimitedDecks && (
              <span className="ml-2 text-xs">
                {userDecks.length}/{FREE_DECK_LIMIT} decks used
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userDecks.length > 0 && <DeckSortSelect currentSort={sort} />}
          <CreateDeckDialog limitReached={limitReached} />
        </div>
      </div>

      {userDecks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <LayersIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">No decks yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Create your first deck to start building and studying flashcards.
            </p>
          </div>
          <CreateDeckDialog triggerLabel="Create your first deck" limitReached={limitReached} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedDecks.map((deck) => (
              <Card key={deck.id} className="relative flex h-44 flex-col hover:border-primary/50 transition-colors cursor-pointer">
                <Link
                  href={`/decks/${deck.id}`}
                  className="absolute inset-0 rounded-xl"
                  aria-label={`Open ${deck.name}`}
                />
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {deck.name}
                    </CardTitle>
                    <Badge variant="secondary" className="relative z-10 shrink-0">
                      {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
                    </Badge>
                  </div>
                  {deck.description && (
                    <CardDescription className="line-clamp-2">
                      {deck.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter className="relative z-10 pt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(deck.updatedAt)}
                  </p>
                  <div className="flex items-center gap-0.5">
                    <EditDeckDialog
                      deckId={deck.id}
                      initialName={deck.name}
                      initialDescription={deck.description}
                    />
                    <DeleteDeckDialog
                      deckId={deck.id}
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
                    className={safePage === totalPages ? "pointer-events-none opacity-50" : ""}
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
