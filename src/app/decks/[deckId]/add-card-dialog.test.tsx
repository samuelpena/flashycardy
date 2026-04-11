import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AddCardDialog } from "./add-card-dialog";

vi.mock("@/actions/cards", () => ({
  createCardAction: vi.fn(),
}));

test("renders Add Card trigger button by default", () => {
  render(<AddCardDialog deckId={1} />);
  expect(screen.getByRole("button", { name: /add card/i })).toBeDefined();
});

test("renders a custom trigger when provided", () => {
  render(
    <AddCardDialog deckId={1} trigger={<button>Custom Trigger</button>} />
  );
  expect(screen.getByRole("button", { name: /custom trigger/i })).toBeDefined();
});
