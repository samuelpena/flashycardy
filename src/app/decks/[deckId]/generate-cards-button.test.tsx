import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GenerateCardsButton } from "./generate-cards-button";

vi.mock("@/actions/cards", () => ({
  generateCardsAction: vi.fn(),
}));

function renderWithTooltip(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

test("renders Generate with AI button when deck has a description", () => {
  renderWithTooltip(<GenerateCardsButton deckId={1} hasDescription={true} />);
  expect(screen.getByRole("button", { name: /generate with ai/i })).toBeDefined();
});

test("button is enabled when deck has a description", () => {
  renderWithTooltip(<GenerateCardsButton deckId={1} hasDescription={true} />);
  const button = screen.getByRole("button", { name: /generate with ai/i });
  expect(button.hasAttribute("disabled")).toBe(false);
});

test("renders disabled Generate with AI button when deck has no description", () => {
  renderWithTooltip(<GenerateCardsButton deckId={1} hasDescription={false} />);
  const button = screen.getByRole("button", { name: /generate with ai/i });
  expect(button.hasAttribute("disabled")).toBe(true);
});
