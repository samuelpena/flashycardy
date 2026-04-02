import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { StudyClient } from "./study-client";

export default async function StudyPage(
  props: PageProps<"/decks/[deckId]/study">
) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { deckId } = await props.params;
  const parsedId = Number(deckId);
  if (isNaN(parsedId)) notFound();

  const deck = await getDeckByIdAndUser(parsedId, userId);
  if (!deck) notFound();

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-8 max-w-3xl mx-auto w-full">
      <div>
        <Link
          href={`/decks/${deck.id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-2"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to {deck.name}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Study: {deck.name}
        </h1>
        {deck.description && (
          <p className="text-muted-foreground text-sm mt-1">
            {deck.description}
          </p>
        )}
      </div>

      <StudyClient cards={deck.cards} />
    </main>
  );
}
