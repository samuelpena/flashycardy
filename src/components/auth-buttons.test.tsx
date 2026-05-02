import { expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/test/render-with-intl";
import { AuthButtons } from "./auth-buttons";

vi.mock("@clerk/nextjs", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

test("renders Sign in and Sign up buttons", () => {
  renderWithIntl(<AuthButtons />);
  expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
  expect(screen.getByRole("button", { name: /sign up/i })).toBeDefined();
});
