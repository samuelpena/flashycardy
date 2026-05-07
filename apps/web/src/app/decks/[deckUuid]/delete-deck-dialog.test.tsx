import { expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/test/render-with-intl";
import { DeleteDeckDialog } from "./delete-deck-dialog";

vi.mock("@/actions/decks", () => ({
  deleteDeckAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const DECK_UUID = "01960000-0000-7000-8000-000000000001";

test("renders the Delete deck trigger button", () => {
  renderWithIntl(<DeleteDeckDialog deckUuid={DECK_UUID} deckName="My Deck" cardCount={5} />);
  expect(screen.getByRole("button", { name: /delete deck/i })).toBeDefined();
});
