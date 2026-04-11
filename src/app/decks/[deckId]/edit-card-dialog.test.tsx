import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditCardDialog } from "./edit-card-dialog";

vi.mock("@/actions/cards", () => ({
  updateCardAction: vi.fn(),
}));

test("renders the edit icon button with accessible label", () => {
  render(
    <EditCardDialog
      cardId={10}
      deckId={1}
      initialFront="Front text"
      initialBack="Back text"
    />
  );
  expect(screen.getByRole("button", { name: /edit card/i })).toBeDefined();
});
