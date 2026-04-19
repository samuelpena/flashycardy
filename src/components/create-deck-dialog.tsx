"use client";

import { useRef, useState, useTransition } from "react";
import { PlusIcon, UploadIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createDeckAction, createDeckFromDocumentAction } from "@/actions/decks";
import { cn } from "@/lib/utils";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

interface CreateDeckDialogProps {
  triggerLabel?: string;
  limitReached?: boolean;
  triggerId?: string;
  /** Pro feature `document_deck_generation` — enables document tab and templates */
  canGenerateDeckFromDocument?: boolean;
}

export function CreateDeckDialog({
  triggerLabel = "New Deck",
  limitReached = false,
  triggerId,
  canGenerateDeckFromDocument = false,
}: CreateDeckDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setDescription("");
      setDocFile(null);
      setError(null);
      setIsDragOver(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setOpen(next);
  }

  function handleSubmitManual(e: React.FormEvent) {
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

  function applyDocumentFile(file: File | undefined, source: "input" | "drop") {
    setError(null);
    if (!file) {
      setDocFile(null);
      if (source === "input" && fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const lower = file.name.toLowerCase();
    const ok =
      lower.endsWith(".pdf") || lower.endsWith(".docx") || lower.endsWith(".pptx");
    if (!ok) {
      setError("Choose a .pdf, .docx, or .pptx file.");
      setDocFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`File must be at most ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`);
      setDocFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setDocFile(file);
    if (source === "drop" && fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDocFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    applyDocumentFile(e.target.files?.[0], "input");
  }

  function hasFilePayload(e: React.DragEvent) {
    return Array.from(e.dataTransfer.types).includes("Files");
  }

  function handleDragEnter(e: React.DragEvent) {
    if (!hasFilePayload(e) || isPending) return;
    e.preventDefault();
    e.stopPropagation();
    const from = e.relatedTarget as Node | null;
    if (from && e.currentTarget.contains(from)) return;
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!hasFilePayload(e) || isPending) return;
    e.preventDefault();
    e.stopPropagation();
    const to = e.relatedTarget as Node | null;
    if (to && e.currentTarget.contains(to)) return;
    setIsDragOver(false);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!hasFilePayload(e) || isPending) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(e: React.DragEvent) {
    if (isPending) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    applyDocumentFile(e.dataTransfer.files?.[0], "drop");
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl !== "string") {
          reject(new Error("read"));
          return;
        }
        const comma = dataUrl.indexOf(",");
        const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("read"));
      reader.readAsDataURL(file);
    });
  }

  function handleSubmitDocument(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!docFile) {
      setError("Select a document to upload.");
      return;
    }

    startTransition(async () => {
      let fileBase64: string;
      try {
        fileBase64 = await fileToBase64(docFile);
      } catch {
        setError("Could not read the file. Try again.");
        return;
      }

      const result = await createDeckFromDocumentAction({
        fileBase64,
        fileName: docFile.name,
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
      setDocFile(null);
      setName("");
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.push(`/decks/${result.deckId}`);
    });
  }

  const manualForm = (
    <form onSubmit={handleSubmitManual} className="flex flex-col gap-4 pt-2">
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
          <span className="text-muted-foreground font-normal">(optional)</span>
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
  );

  const documentForm = (
    <form onSubmit={handleSubmitDocument} className="flex flex-col gap-4 pt-2">
      <p className="text-sm text-muted-foreground">
        Upload lecture notes or slides as PDF, Word (.docx), or PowerPoint (.pptx). We extract
        text, pick a title and description, and add 20 study questions as flashcards.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="deck-document">Document</Label>
        <input
          ref={fileInputRef}
          id="deck-document"
          type="file"
          accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="sr-only"
          onChange={handleDocFileChange}
          disabled={isPending}
        />
        <Card
          size="sm"
          role="button"
          tabIndex={0}
          aria-describedby="deck-document-hint"
          aria-label="Document upload: drag and drop a file or press Enter to choose"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isPending) fileInputRef.current?.click();
            }
          }}
          onClick={() => {
            if (!isPending) fileInputRef.current?.click();
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "cursor-pointer py-0 ring-0 transition-colors border-2 border-dashed outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/20 hover:bg-muted/40",
          )}
        >
          <CardContent className="flex flex-col items-center justify-center gap-3 py-8 text-center pointer-events-none">
            <UploadIcon className="size-8 text-muted-foreground" aria-hidden />
            <div className="space-y-1 px-2">
              <p className="text-sm text-foreground">
                Drag and drop a file here, or{" "}
                <span className="text-primary underline decoration-primary underline-offset-4">
                  choose file
                </span>
              </p>
              <p id="deck-document-hint" className="text-xs text-muted-foreground">
                PDF, Word (.docx), or PowerPoint (.pptx), up to {MAX_UPLOAD_BYTES / (1024 * 1024)} MB
              </p>
            </div>
            {docFile ? (
              <p className="text-xs text-muted-foreground truncate max-w-full px-2">
                Selected: <span className="font-medium text-foreground">{docFile.name}</span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No file selected</p>
            )}
          </CardContent>
        </Card>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending || !docFile}>
          {isPending ? "Generating…" : "Generate deck"}
        </Button>
      </DialogFooter>
    </form>
  );

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
                Free plans are limited to 3 decks. Upgrade to Pro for unlimited decks and more.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <Button nativeButton={false} render={<Link href="/pricing" />}>
                View Plans
              </Button>
            </DialogFooter>
          </>
        ) : canGenerateDeckFromDocument ? (
          <>
            <DialogHeader>
              <DialogTitle>Create a new deck</DialogTitle>
              <DialogDescription>
                Enter a name and description, or generate a deck from a document (Pro).
              </DialogDescription>
            </DialogHeader>
            <Tabs
              defaultValue="manual"
              className="gap-4"
              onValueChange={() => setError(null)}
            >
              <TabsList>
                <TabsTrigger value="manual">Name &amp; description</TabsTrigger>
                <TabsTrigger value="document">From document</TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="flex flex-col gap-0">
                {manualForm}
              </TabsContent>
              <TabsContent value="document" className="flex flex-col gap-0">
                {documentForm}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create a new deck</DialogTitle>
              <DialogDescription>
                Give your deck a name and an optional description.
              </DialogDescription>
            </DialogHeader>
            {manualForm}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
