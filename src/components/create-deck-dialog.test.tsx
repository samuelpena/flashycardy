import { expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CreateDeckDialog } from "./create-deck-dialog";

vi.mock("@/actions/decks", () => ({
  createDeckAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("renders the trigger button with default label", () => {
  render(<CreateDeckDialog />);
  expect(screen.getByRole("button", { name: /new deck/i })).toBeDefined();
});

test("renders the trigger button with a custom label", () => {
  render(<CreateDeckDialog triggerLabel="Add Deck" />);
  expect(screen.getByRole("button", { name: /add deck/i })).toBeDefined();
});
