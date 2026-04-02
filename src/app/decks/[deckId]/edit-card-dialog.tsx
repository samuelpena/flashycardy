"use client";

import { useState, useTransition } from "react";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCardAction } from "@/actions/cards";

interface EditCardDialogProps {
  cardId: number;
  deckId: number;
  initialFront: string;
  initialBack: string;
}

export function EditCardDialog({
  cardId,
  deckId,
  initialFront,
  initialBack,
}: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setFront(initialFront);
      setBack(initialBack);
      setError(null);
    }
    setOpen(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateCardAction({ cardId, deckId, front, back });

      if (result?.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Please check the form and try again."
        );
        return;
      }

      setOpen(false);
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" />
        <span className="sr-only">Edit card</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update the front and back of this flashcard.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-card-front">Front</Label>
              <Input
                id="edit-card-front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Front of the card"
                required
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-card-back">Back</Label>
              <Input
                id="edit-card-back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Back of the card"
                required
                disabled={isPending}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
