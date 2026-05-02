import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { getDeckByUuidAndUser } from "@/db/queries/decks";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { StudyClient } from "./study-client";

export default async function StudyPage(
  props: PageProps<"/decks/[deckUuid]/study">,
) {
  const t = await getTranslations("StudyPage");

  const { deckUuid } = await props.params;
  const parsed = z.string().uuid().safeParse(deckUuid);
  if (!parsed.success) notFound();
  const validDeckUuid = parsed.data;

  const { userId } = await auth();
  if (!userId) redirect("/");

  const deck = await getDeckByUuidAndUser(validDeckUuid, userId);
  if (!deck) notFound();

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-8 max-w-3xl mx-auto w-full">
      <div>
        <Link
          href={`/decks/${validDeckUuid}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-2"
        >
          <ArrowLeftIcon className="size-3.5" />
          {t("backToDeck", { name: deck.name })}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("title", { name: deck.name })}
        </h1>
        {deck.description && (
          <p className="text-muted-foreground text-sm mt-1">
            {deck.description}
          </p>
        )}
      </div>

      <StudyClient deckUuid={deck.uuid} cards={deck.cards} />
    </main>
  );
}
