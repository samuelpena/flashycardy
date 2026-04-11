"use client";

import { useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDeckAction } from "@/actions/decks";

interface CreateDeckDialogProps {
  triggerLabel?: string;
  limitReached?: boolean;
  triggerId?: string;
}

export function CreateDeckDialog({
  triggerLabel = "New Deck",
  limitReached = false,
  triggerId,
}: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setDescription("");
      setError(null);
    }
    setOpen(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createDeckAction({
        name,
        description: description || undefined,
      });

      if (result?.error) {
        if (typeof result.error === "string") {
          setError(result.error);
        } else {
          const fieldErrors = result.error.fieldErrors;
          const first = Object.values(fieldErrors).flat()[0];
          setError(first ?? "Something went wrong.");
        }
        return;
      }

      setOpen(false);
      setName("");
      setDescription("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button id={triggerId} />}>
        <PlusIcon className="size-4" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        {limitReached ? (
          <>
            <DialogHeader>
              <DialogTitle>Deck limit reached</DialogTitle>
              <DialogDescription>
                Free plans are limited to 3 decks. Upgrade to Pro for unlimited
                decks and more.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <Button nativeButton={false} render={<Link href="/pricing" />}>
                View Plans
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create a new deck</DialogTitle>
              <DialogDescription>
                Give your deck a name and an optional description.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="deck-name">Name</Label>
                <Input
                  id="deck-name"
                  placeholder="e.g. Spanish Vocabulary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={255}
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="deck-description">
                  Description{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="deck-description"
                  placeholder="What is this deck about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  disabled={isPending}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter showCloseButton>
                <Button type="submit" disabled={isPending || !name.trim()}>
                  {isPending ? "Creating…" : "Create deck"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
