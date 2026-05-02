import { expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/test/render-with-intl";
import { CardSortSelect } from "./card-sort-select";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/decks/1",
  useSearchParams: () => new URLSearchParams(),
}));

test("renders the select trigger with the current sort label", () => {
  renderWithIntl(<CardSortSelect currentSort="updated" />);
  expect(screen.getByText("Last updated")).toBeDefined();
});

test("renders with az sort label", () => {
  renderWithIntl(<CardSortSelect currentSort="az" />);
  expect(screen.getByText("A → Z")).toBeDefined();
});

test("renders with za sort label", () => {
  renderWithIntl(<CardSortSelect currentSort="za" />);
  expect(screen.getByText("Z → A")).toBeDefined();
});
