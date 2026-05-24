"use client";

import { StudySession } from "@flashycardy/features";
import { saveStudySessionAction } from "@/actions/study-sessions";

type StudyClientProps = {
  deckUuid: string;
  cards: { uuid: string; front: string; back: string }[];
};

export function StudyClient({ deckUuid, cards }: StudyClientProps) {
  return (
    <StudySession
      deckUuid={deckUuid}
      cards={cards}
      onSaveSession={async (input) => {
        const result = await saveStudySessionAction(input);
        if (result && "error" in result && result.error) {
          return {
            error: typeof result.error === "string" ? result.error : undefined,
          };
        }
      }}
    />
  );
}
