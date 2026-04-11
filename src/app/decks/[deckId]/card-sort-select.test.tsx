import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardSortSelect } from "./card-sort-select";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/decks/1",
  useSearchParams: () => new URLSearchParams(),
}));

test("renders the select trigger with the current sort label", () => {
  render(<CardSortSelect currentSort="updated" />);
  expect(screen.getByText("Last updated")).toBeDefined();
});

test("renders with az sort label", () => {
  render(<CardSortSelect currentSort="az" />);
  expect(screen.getByText("A → Z")).toBeDefined();
});

test("renders with za sort label", () => {
  render(<CardSortSelect currentSort="za" />);
  expect(screen.getByText("Z → A")).toBeDefined();
});
