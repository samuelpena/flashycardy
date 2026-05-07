import { expect, test, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/test/render-with-intl";
import { CreateDeckDialog } from "./create-deck-dialog";

vi.mock("@/actions/decks", () => ({
  createDeckAction: vi.fn(),
  createDeckFromDocumentAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("renders the trigger button with default label", () => {
  renderWithIntl(<CreateDeckDialog />);
  expect(screen.getByRole("button", { name: /new deck/i })).toBeDefined();
});

test("renders the trigger button with a custom label", () => {
  renderWithIntl(<CreateDeckDialog triggerLabel="Add Deck" />);
  expect(screen.getByRole("button", { name: /add deck/i })).toBeDefined();
});
