import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NextIntlClientProvider } from "next-intl";
import { enMessages } from "@/test/render-with-intl";
import { GenerateCardsButton } from "./generate-cards-button";

vi.mock("@/actions/cards", () => ({
  generateCardsAction: vi.fn(),
}));

function renderWithTooltip(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <TooltipProvider>{ui}</TooltipProvider>
    </NextIntlClientProvider>,
  );
}

const DECK_UUID = "01960000-0000-7000-8000-000000000001";

test("renders Generate with AI button when deck has a description", () => {
  renderWithTooltip(<GenerateCardsButton deckUuid={DECK_UUID} hasDescription={true} />);
  expect(screen.getByRole("button", { name: /generate with ai/i })).toBeDefined();
});

test("button is enabled when deck has a description", () => {
  renderWithTooltip(<GenerateCardsButton deckUuid={DECK_UUID} hasDescription={true} />);
  const button = screen.getByRole("button", { name: /generate with ai/i });
  expect(button.hasAttribute("disabled")).toBe(false);
});

test("renders disabled Generate with AI button when deck has no description", () => {
  renderWithTooltip(<GenerateCardsButton deckUuid={DECK_UUID} hasDescription={false} />);
  const button = screen.getByRole("button", { name: /generate with ai/i });
  expect(button.hasAttribute("disabled")).toBe(true);
});
