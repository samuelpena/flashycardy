"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcwIcon,
  ShuffleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  LayersIcon,
  Loader2Icon,
} from "lucide-react";
import { saveStudySessionAction } from "@/actions/study-sessions";

type Card = {
  id: number;
  front: string;
  back: string;
};

type Rating = "correct" | "incorrect";

interface StudyClientProps {
  deckId: number;
  cards: Card[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function StudyClient({ deckId, cards }: StudyClientProps) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<Record<number, Rating>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedRef = useRef(false);

  const total = deck.length;
  const current = deck[index];

  useEffect(() => {
    if (!completed || savedRef.current) return;
    savedRef.current = true;

    const cardResults = deck
      .filter((card) => results[card.id] !== undefined)
      .map((card) => ({
        cardId: card.id,
        isCorrect: results[card.id] === "correct",
      }));

    if (cardResults.length === 0) return;

    setSaving(true);
    setSaveError(null);
    saveStudySessionAction({ deckId, cardResults })
      .then((res) => {
        if ("error" in res) {
          setSaveError(
            typeof res.error === "string" ? res.error : "Failed to save results."
          );
        }
      })
      .catch(() => setSaveError("Failed to save results."))
      .finally(() => setSaving(false));
  }, [completed, deck, results, deckId]);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  const goNext = useCallback(() => {
    if (index === total - 1) {
      setCompleted(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }, [index, total]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setFlipped(false);
    }
  }, [index]);

  const markResult = useCallback(
    (rating: Rating) => {
      setResults((prev) => ({ ...prev, [current.id]: rating }));
      goNext();
    },
    [current, goNext]
  );

  const restart = useCallback(() => {
    savedRef.current = false;
    setDeck(cards);
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
    setResults({});
    setSaveError(null);
  }, [cards]);

  const shuffle = useCallback(() => {
    savedRef.current = false;
    setDeck(shuffleArray(cards));
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
    setResults({});
    setSaveError(null);
  }, [cards]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      }
      if (e.key === "ArrowRight" && !flipped) flip();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [flip, goNext, goPrev, flipped]);

  if (total === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <LayersIcon className="size-6 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold">No cards in this deck</p>
          <p className="text-sm text-muted-foreground">
            Add some cards to start studying.
          </p>
        </div>
      </div>
    );
  }

  if (completed) {
    const correct = Object.values(results).filter((r) => r === "correct").length;
    const incorrect = Object.values(results).filter(
      (r) => r === "incorrect"
    ).length;
    const rated = correct + incorrect;
    const pct = rated > 0 ? Math.round((correct / rated) * 100) : null;

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-20 text-center">
        <div>
          <p className="text-2xl font-bold">Session complete!</p>
          <p className="text-muted-foreground mt-1">
            You studied all {total} {total === 1 ? "card" : "cards"}.
          </p>
        </div>

        {rated > 0 && (
          <div className="w-full max-w-sm flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col items-center gap-1.5 rounded-xl border bg-card py-5">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
                  <ThumbsUpIcon className="size-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold">{correct}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Correct
                </p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 rounded-xl border bg-card py-5">
                <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10">
                  <ThumbsDownIcon className="size-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold">{incorrect}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Incorrect
                </p>
              </div>
            </div>

            {pct !== null && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Score</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}

            {rated < total && (
              <p className="text-xs text-muted-foreground">
                {total - rated}{" "}
                {total - rated === 1 ? "card was" : "cards were"} skipped
                without a rating.
              </p>
            )}
          </div>
        )}

        {saving && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2Icon className="size-3 animate-spin" />
            Saving results…
          </p>
        )}
        {saveError && (
          <p className="text-xs text-red-400">{saveError}</p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={shuffle}>
            <ShuffleIcon className="size-4" />
            Shuffle &amp; restart
          </Button>
          <Button onClick={restart}>
            <RotateCcwIcon className="size-4" />
            Restart
          </Button>
        </div>
      </div>
    );
  }

  const progress = ((index + 1) / total) * 100;

  return (
    <div className="flex flex-1 flex-col gap-5 items-center">
      {/* Header row: progress badge + controls */}
      <div className="flex items-center justify-between w-full">
        <Badge variant="secondary">
          {index + 1} / {total}
        </Badge>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={shuffle}>
            <ShuffleIcon className="size-4" />
            Shuffle
          </Button>
          <Button variant="ghost" size="sm" onClick={restart}>
            <RotateCcwIcon className="size-4" />
            Restart
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard with 3D flip */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1200px" }}
        onClick={flip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            flip();
          }
        }}
        aria-label={
          flipped
            ? "Card showing back — click to show front"
            : "Card showing front — click to show back"
        }
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "300px",
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-card px-10 py-12 text-center gap-4"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Front
            </p>
            <p className="text-2xl font-semibold leading-snug">{current.front}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Click or press{" "}
              <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs bg-muted">
                Space
              </kbd>{" "}
              to flip
            </p>
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-card px-10 py-12 text-center gap-4"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Back
            </p>
            <p className="text-2xl font-semibold leading-snug">{current.back}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Did you get it right?
            </p>
          </div>
        </div>
      </div>

      {/* Navigation / rating */}
      {flipped ? (
        <div className="flex items-center gap-3 mt-1">
          <Button
            variant="outline"
            size="lg"
            onClick={goPrev}
            disabled={index === 0}
          >
            <ChevronLeftIcon className="size-5" />
            Previous
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/60"
            onClick={(e) => {
              e.stopPropagation();
              markResult("incorrect");
            }}
            aria-label="Mark as incorrect"
          >
            <ThumbsDownIcon className="size-5" />
            Nope
          </Button>
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={(e) => {
              e.stopPropagation();
              markResult("correct");
            }}
            aria-label="Mark as correct"
          >
            <ThumbsUpIcon className="size-5" />
            Got it
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-1">
          <Button
            variant="outline"
            size="lg"
            onClick={goPrev}
            disabled={index === 0}
          >
            <ChevronLeftIcon className="size-5" />
            Previous
          </Button>
          <Button size="lg" onClick={flip}>
            {index === total - 1 ? "Reveal & Finish" : "Next"}
            <ChevronRightIcon className="size-5" />
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Use{" "}
        <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs bg-muted">
          ←
        </kbd>{" "}
        <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs bg-muted">
          →
        </kbd>{" "}
        to navigate ·{" "}
        <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs bg-muted">
          Space
        </kbd>{" "}
        to flip
      </p>
    </div>
  );
}
