import { expect, test, describe, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StudyClient } from "./study-client";

const CARDS = [
  { id: 1, front: "What is H2O?", back: "Water" },
  { id: 2, front: "What is NaCl?", back: "Salt" },
  { id: 3, front: "What is O2?", back: "Oxygen" },
];

describe("StudyClient — empty deck", () => {
  test("shows empty state message when no cards are provided", () => {
    render(<StudyClient cards={[]} />);
    expect(screen.getByText("No cards in this deck")).toBeDefined();
  });
});

describe("StudyClient — with cards", () => {
  beforeEach(() => {
    render(<StudyClient cards={CARDS} />);
  });

  test("shows progress counter starting at 1 / total", () => {
    expect(screen.getByText("1 / 3")).toBeDefined();
  });

  test("shows the front of the first card", () => {
    expect(screen.getByText("What is H2O?")).toBeDefined();
  });

  test("shows Front label on the visible face", () => {
    expect(screen.getByText("Front")).toBeDefined();
  });

  test("renders Previous button disabled on the first card", () => {
    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton.hasAttribute("disabled")).toBe(true);
  });

  test("renders Next button enabled on the first card", () => {
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton.hasAttribute("disabled")).toBe(false);
  });

  test("advances to the second card when Next is clicked", () => {
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("2 / 3")).toBeDefined();
    expect(screen.getByText("What is NaCl?")).toBeDefined();
  });

  test("Previous button becomes enabled after advancing", () => {
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton.hasAttribute("disabled")).toBe(false);
  });

  test("Next button shows Finish on the last card", () => {
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByRole("button", { name: /finish/i })).toBeDefined();
  });

  test("shows completion screen after clicking Finish", () => {
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /finish/i }));
    expect(screen.getByText("Session complete!")).toBeDefined();
    expect(screen.getByText(/you studied all 3 cards/i)).toBeDefined();
  });

  test("Restart resets back to the first card", () => {
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /finish/i }));
    fireEvent.click(screen.getByRole("button", { name: /^restart$/i }));
    expect(screen.getByText("1 / 3")).toBeDefined();
  });

  test("navigates backward with the Previous button", () => {
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(screen.getByText("1 / 3")).toBeDefined();
  });
});

describe("StudyClient — single card", () => {
  test("shows Finish immediately when only one card is present", () => {
    render(<StudyClient cards={[{ id: 1, front: "Q", back: "A" }]} />);
    expect(screen.getByRole("button", { name: /finish/i })).toBeDefined();
  });

  test("completion message uses singular 'card'", () => {
    render(<StudyClient cards={[{ id: 1, front: "Q", back: "A" }]} />);
    fireEvent.click(screen.getByRole("button", { name: /finish/i }));
    expect(screen.getByText(/you studied all 1 card\./i)).toBeDefined();
  });
});
