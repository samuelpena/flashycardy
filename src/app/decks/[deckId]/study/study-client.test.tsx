import { expect, test, describe, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StudyClient } from "./study-client";

vi.mock("@/actions/study-sessions", () => ({
  saveStudySessionAction: vi.fn().mockResolvedValue({ success: true }),
}));

const DECK_UUID = "01960000-0000-7000-8000-000000000001";

const CARDS = [
  { uuid: "01960000-0000-7000-8000-000000000011", front: "What is H2O?", back: "Water" },
  { uuid: "01960000-0000-7000-8000-000000000012", front: "What is NaCl?", back: "Salt" },
  { uuid: "01960000-0000-7000-8000-000000000013", front: "What is O2?", back: "Oxygen" },
];

/** Flip the current card then rate it correct to advance to the next card. */
function flipAndRate(rating: "correct" | "incorrect" = "correct") {
  fireEvent.click(
    screen.getByRole("button", { name: /card showing front/i })
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: rating === "correct" ? /mark as correct/i : /mark as incorrect/i,
    })
  );
}

describe("StudyClient — empty deck", () => {
  test("shows empty state message when no cards are provided", () => {
    render(<StudyClient deckUuid={DECK_UUID} cards={[]} />);
    expect(screen.getByText("No cards in this deck")).toBeDefined();
  });
});

describe("StudyClient — with cards", () => {
  beforeEach(() => {
    render(<StudyClient deckUuid={DECK_UUID} cards={CARDS} />);
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

  test("Next button flips the card to show the back", () => {
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByRole("button", { name: /mark as correct/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /mark as incorrect/i })).toBeDefined();
  });

  test("advances to the second card after flipping and rating", () => {
    flipAndRate();
    expect(screen.getByText("2 / 3")).toBeDefined();
    expect(screen.getByText("What is NaCl?")).toBeDefined();
  });

  test("Previous button becomes enabled after advancing", () => {
    flipAndRate();
    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton.hasAttribute("disabled")).toBe(false);
  });

  test("last card shows Reveal & Finish button", () => {
    flipAndRate();
    flipAndRate();
    expect(screen.getByRole("button", { name: /reveal & finish/i })).toBeDefined();
  });

  test("shows thumbs rating buttons when card is flipped", () => {
    const card = screen.getByRole("button", { name: /card showing front/i });
    fireEvent.click(card);
    expect(screen.getByRole("button", { name: /mark as correct/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /mark as incorrect/i })).toBeDefined();
  });

  test("hides Next and shows rating buttons when flipped", () => {
    const card = screen.getByRole("button", { name: /card showing front/i });
    fireEvent.click(card);
    expect(screen.queryByRole("button", { name: /^next$/i })).toBeNull();
    expect(screen.getByRole("button", { name: /mark as correct/i })).toBeDefined();
  });

  test("advances to next card after marking correct", () => {
    flipAndRate("correct");
    expect(screen.getByText("2 / 3")).toBeDefined();
  });

  test("advances to next card after marking incorrect", () => {
    flipAndRate("incorrect");
    expect(screen.getByText("2 / 3")).toBeDefined();
  });

  test("navigates backward with the Previous button", () => {
    flipAndRate();
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(screen.getByText("1 / 3")).toBeDefined();
  });
});

const SINGLE_CARD_UUID = "01960000-0000-7000-8000-000000000099";

describe("StudyClient — completion screen", () => {
  test("shows completion screen after rating all cards", () => {
    render(<StudyClient deckUuid={DECK_UUID} cards={CARDS} />);
    flipAndRate("correct");
    flipAndRate("correct");
    flipAndRate("correct");
    expect(screen.getByText("Session complete!")).toBeDefined();
    expect(screen.getByText(/you studied all 3 cards/i)).toBeDefined();
  });

  test("shows correct/incorrect counts on completion screen", () => {
    render(<StudyClient deckUuid={DECK_UUID} cards={CARDS} />);

    flipAndRate("correct");
    flipAndRate("incorrect");
    flipAndRate("correct");

    expect(screen.getByText("Session complete!")).toBeDefined();
    expect(screen.getByText("Correct")).toBeDefined();
    expect(screen.getByText("Incorrect")).toBeDefined();
  });

  test("Restart resets back to the first card and clears results", () => {
    render(<StudyClient deckUuid={DECK_UUID} cards={CARDS} />);
    flipAndRate("correct");
    flipAndRate("correct");
    flipAndRate("correct");
    fireEvent.click(screen.getByRole("button", { name: /^restart$/i }));
    expect(screen.getByText("1 / 3")).toBeDefined();
  });
});

describe("StudyClient — single card", () => {
  test("shows Reveal & Finish button when only one card is present", () => {
    render(<StudyClient deckUuid={DECK_UUID} cards={[{ uuid: SINGLE_CARD_UUID, front: "Q", back: "A" }]} />);
    expect(screen.getByRole("button", { name: /reveal & finish/i })).toBeDefined();
  });

  test("flips single card when Reveal & Finish is clicked", () => {
    render(<StudyClient deckUuid={DECK_UUID} cards={[{ uuid: SINGLE_CARD_UUID, front: "Q", back: "A" }]} />);
    fireEvent.click(screen.getByRole("button", { name: /reveal & finish/i }));
    expect(screen.getByRole("button", { name: /mark as correct/i })).toBeDefined();
  });

  test("completion message uses singular 'card'", () => {
    render(<StudyClient deckUuid={DECK_UUID} cards={[{ uuid: SINGLE_CARD_UUID, front: "Q", back: "A" }]} />);
    fireEvent.click(screen.getByRole("button", { name: /reveal & finish/i }));
    fireEvent.click(screen.getByRole("button", { name: /mark as correct/i }));
    expect(screen.getByText(/you studied all 1 card\./i)).toBeDefined();
  });

  test("completes session after rating the single card", () => {
    render(<StudyClient deckUuid={DECK_UUID} cards={[{ uuid: SINGLE_CARD_UUID, front: "Q", back: "A" }]} />);
    const card = screen.getByRole("button", { name: /card showing front/i });
    fireEvent.click(card);
    fireEvent.click(screen.getByRole("button", { name: /mark as correct/i }));
    expect(screen.getByText("Session complete!")).toBeDefined();
  });
});
