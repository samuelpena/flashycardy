import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeleteCardDialog } from "./delete-card-dialog";

vi.mock("@/actions/cards", () => ({
  deleteCardAction: vi.fn(),
}));

const DECK_UUID = "01960000-0000-7000-8000-000000000001";
const CARD_UUID = "01960000-0000-7000-8000-000000000002";

test("renders the delete icon button with accessible label", () => {
  render(<DeleteCardDialog cardUuid={CARD_UUID} deckUuid={DECK_UUID} />);
  expect(screen.getByRole("button", { name: /delete card/i })).toBeDefined();
});
