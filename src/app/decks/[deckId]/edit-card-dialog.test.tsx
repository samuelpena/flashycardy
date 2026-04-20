import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditCardDialog } from "./edit-card-dialog";

vi.mock("@/actions/cards", () => ({
  updateCardAction: vi.fn(),
}));

const DECK_UUID = "01960000-0000-7000-8000-000000000001";
const CARD_UUID = "01960000-0000-7000-8000-000000000002";

test("renders the edit icon button with accessible label", () => {
  render(
    <EditCardDialog
      cardUuid={CARD_UUID}
      deckUuid={DECK_UUID}
      initialFront="Front text"
      initialBack="Back text"
    />
  );
  expect(screen.getByRole("button", { name: /edit card/i })).toBeDefined();
});
