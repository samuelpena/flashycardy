import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, PlusIcon, LayersIcon, BookOpenIcon } from "lucide-react";
import Link from "next/link";
import { EditDeckDialog } from "./edit-deck-dialog";
import { AddCardDialog } from "./add-card-dialog";
import { EditCardDialog } from "./edit-card-dialog";
import { DeleteCardDialog } from "./delete-card-dialog";
import { CardSortSelect, type CardSortOption } from "./card-sort-select";

export default async function DeckPage(props: PageProps<"/decks/[deckId]">) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { deckId } = await props.params;
  const parsedId = Number(deckId);
  if (isNaN(parsedId)) notFound();

  const deck = await getDeckByIdAndUser(parsedId, userId);
  if (!deck) notFound();

  const { sort: rawSort } = await props.searchParams;
  const sort: CardSortOption =
    rawSort === "az" || rawSort === "za" ? rawSort : "updated";

  const sortedCards = [...deck.cards].sort((a, b) => {
    if (sort === "az") return a.front.localeCompare(b.front);
    if (sort === "za") return b.front.localeCompare(a.front);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-1"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to decks
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{deck.name}</h1>
            <Badge variant="secondary">
              {deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"}
            </Badge>
          </div>
          {deck.description && (
            <p className="text-muted-foreground mt-0.5">{deck.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            nativeButton={false}
            render={<Link href={`/decks/${deck.id}/study`} />}
          >
            <BookOpenIcon className="size-4" />
            Study
          </Button>
          <AddCardDialog deckId={deck.id} />
          <EditDeckDialog
            deckId={deck.id}
            initialName={deck.name}
            initialDescription={deck.description ?? null}
          />
          <CardSortSelect currentSort={sort} />
        </div>
      </div>

      {deck.cards.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <LayersIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">No cards yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Add your first card to start studying this deck.
            </p>
          </div>
          <AddCardDialog
            deckId={deck.id}
            trigger={
              <Button>
                <PlusIcon className="size-4" />
                Add your first card
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCards.map((card) => (
            <Card key={card.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Front
                </CardTitle>
                <p className="text-sm font-medium leading-snug">{card.front}</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0">
                <div className="h-px w-full bg-border" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Back
                </p>
                <p className="text-sm text-muted-foreground leading-snug">
                  {card.back}
                </p>
              </CardContent>
              <CardFooter className="pt-1 justify-end gap-1">
                <DeleteCardDialog cardId={card.id} deckId={deck.id} />
                <EditCardDialog
                  cardId={card.id}
                  deckId={deck.id}
                  initialFront={card.front}
                  initialBack={card.back}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
