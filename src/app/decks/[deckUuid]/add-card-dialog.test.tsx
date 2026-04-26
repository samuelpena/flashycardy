import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AddCardDialog } from "./add-card-dialog";

vi.mock("@/actions/cards", () => ({
  createCardAction: vi.fn(),
}));

const DECK_UUID = "01960000-0000-7000-8000-000000000001";

test("renders Add Card trigger button by default", () => {
  render(<AddCardDialog deckUuid={DECK_UUID} />);
  expect(screen.getByRole("button", { name: /add card/i })).toBeDefined();
});

test("renders a custom trigger when provided", () => {
  render(
    <AddCardDialog deckUuid={DECK_UUID} trigger={<button>Custom Trigger</button>} />
  );
  expect(screen.getByRole("button", { name: /custom trigger/i })).toBeDefined();
});
