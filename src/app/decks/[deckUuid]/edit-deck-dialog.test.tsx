import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditDeckDialog } from "./edit-deck-dialog";

vi.mock("@/actions/decks", () => ({
  updateDeckAction: vi.fn(),
}));

const DECK_UUID = "01960000-0000-7000-8000-000000000001";

test("renders the Edit button trigger", () => {
  render(
    <EditDeckDialog deckUuid={DECK_UUID} initialName="My Deck" initialDescription={null} />
  );
  expect(screen.getByRole("button", { name: /^edit$/i })).toBeDefined();
});

test("renders with existing description prop without throwing", () => {
  render(
    <EditDeckDialog
      deckUuid={DECK_UUID}
      initialName="My Deck"
      initialDescription="A description"
    />
  );
  expect(screen.getByRole("button", { name: /^edit$/i })).toBeDefined();
});
