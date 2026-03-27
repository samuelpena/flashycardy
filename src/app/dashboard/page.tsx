import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, LayersIcon } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const userDecks = await db
    .select({
      id: decks.id,
      name: decks.name,
      description: decks.description,
      createdAt: decks.createdAt,
      cardCount: count(cards.id),
    })
    .from(decks)
    .leftJoin(cards, eq(cards.deckId, decks.id))
    .where(eq(decks.clerkUserId, userId))
    .groupBy(decks.id);

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Decks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and study your flashcard decks.
          </p>
        </div>
        <Button>
          <PlusIcon className="size-4" />
          New Deck
        </Button>
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
          <Button>
            <PlusIcon className="size-4" />
            Create your first deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userDecks.map((deck) => (
            <Card
              key={deck.id}
              className="flex flex-col hover:border-primary/50 transition-colors cursor-pointer"
            >
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight">
                    {deck.name}
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
                  </Badge>
                </div>
                {deck.description && (
                  <CardDescription className="line-clamp-2">
                    {deck.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardFooter className="pt-0">
                <p className="text-xs text-muted-foreground">
                  Created{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(deck.createdAt)}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
