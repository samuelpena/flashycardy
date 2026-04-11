import { expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackButton } from "./back-button";

const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack }),
}));

test("renders a Back button", () => {
  render(<BackButton />);
  expect(screen.getByRole("button", { name: /back/i })).toBeDefined();
});

test("calls router.back when clicked", () => {
  render(<BackButton />);
  fireEvent.click(screen.getByRole("button", { name: /back/i }));
  expect(mockBack).toHaveBeenCalledTimes(1);
});
