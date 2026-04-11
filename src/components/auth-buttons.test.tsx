import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthButtons } from "./auth-buttons";

vi.mock("@clerk/nextjs", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

test("renders Sign in and Sign up buttons", () => {
  render(<AuthButtons />);
  expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
  expect(screen.getByRole("button", { name: /sign up/i })).toBeDefined();
});
