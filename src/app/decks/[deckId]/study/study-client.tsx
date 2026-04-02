"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcwIcon,
  ShuffleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  LayersIcon,
} from "lucide-react";

type Card = {
  id: number;
  front: string;
  back: string;
};

interface StudyClientProps {
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

export function StudyClient({ cards }: StudyClientProps) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const total = deck.length;
  const current = deck[index];

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

  const restart = useCallback(() => {
    setDeck(cards);
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
  }, [cards]);

  const shuffle = useCallback(() => {
    setDeck(shuffleArray(cards));
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
  }, [cards]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      }
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [flip, goNext, goPrev]);

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
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2Icon className="size-10 text-green-500" />
        </div>
        <div>
          <p className="text-2xl font-bold">Session complete!</p>
          <p className="text-muted-foreground mt-1">
            You studied all {total} {total === 1 ? "card" : "cards"}.
          </p>
        </div>
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
        aria-label={flipped ? "Card showing back — click to show front" : "Card showing front — click to show back"}
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
          </div>
        </div>
      </div>

      {/* Navigation */}
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
        <Button size="lg" onClick={goNext}>
          {index === total - 1 ? "Finish" : "Next"}
          <ChevronRightIcon className="size-5" />
        </Button>
      </div>

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
