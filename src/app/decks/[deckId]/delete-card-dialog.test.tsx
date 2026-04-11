import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeleteCardDialog } from "./delete-card-dialog";

vi.mock("@/actions/cards", () => ({
  deleteCardAction: vi.fn(),
}));

test("renders the delete icon button with accessible label", () => {
  render(<DeleteCardDialog cardId={10} deckId={1} />);
  expect(screen.getByRole("button", { name: /delete card/i })).toBeDefined();
});
