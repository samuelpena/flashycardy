import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeleteDeckDialog } from "./delete-deck-dialog";

vi.mock("@/actions/decks", () => ({
  deleteDeckAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

test("renders the Delete deck trigger button", () => {
  render(<DeleteDeckDialog deckId={1} deckName="My Deck" cardCount={5} />);
  expect(screen.getByRole("button", { name: /delete deck/i })).toBeDefined();
});
