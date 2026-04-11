import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditDeckDialog } from "./edit-deck-dialog";

vi.mock("@/actions/decks", () => ({
  updateDeckAction: vi.fn(),
}));

test("renders the Edit button trigger", () => {
  render(
    <EditDeckDialog deckId={1} initialName="My Deck" initialDescription={null} />
  );
  expect(screen.getByRole("button", { name: /^edit$/i })).toBeDefined();
});

test("renders with existing description prop without throwing", () => {
  render(
    <EditDeckDialog
      deckId={1}
      initialName="My Deck"
      initialDescription="A description"
    />
  );
  expect(screen.getByRole("button", { name: /^edit$/i })).toBeDefined();
});
