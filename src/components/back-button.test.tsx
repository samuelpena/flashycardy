import { expect, test, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithIntl } from "@/test/render-with-intl";
import { BackButton } from "./back-button";

const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack }),
}));

test("renders a Back button", () => {
  renderWithIntl(<BackButton />);
  expect(screen.getByRole("button", { name: /back/i })).toBeDefined();
});

test("calls router.back when clicked", () => {
  renderWithIntl(<BackButton />);
  fireEvent.click(screen.getByRole("button", { name: /back/i }));
  expect(mockBack).toHaveBeenCalledTimes(1);
});
