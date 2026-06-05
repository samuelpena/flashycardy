import Foundation

/// English UI strings (PR-6 will migrate to `Localizable.xcstrings`).
enum L10n {
    enum Common {
        static let cancel = "Cancel"
        static let save = "Save changes"
        static let saving = "Saving…"
        static let edit = "Edit"
        static let delete = "Delete"
        static let front = "Front"
        static let back = "Back"
        static let tryAgain = "Something went wrong. Try again."
        static func deckLimitBanner(used: Int, limit: Int) -> String {
            "\(used)/\(limit) decks used"
        }
        static func cardCount(_ count: Int) -> String {
            count == 1 ? "1 card" : "\(count) cards"
        }
        static func updatedLabel(_ date: String) -> String {
            "Updated \(date)"
        }
    }

    enum Dashboard {
        static let title = "Your Decks"
        static let subtitle = "Manage and study your flashcard decks."
        static let analytics = "Analytics"
        static let emptyTitle = "No decks yet"
        static let emptyDescription = "Create your first deck to start building and studying flashcards."
        static let nameHeader = "Name"
        static let descriptionHeader = "Description"
        static let pageOf = "Page %d of %d"
    }

    enum DeckSort {
        static let updated = "Last updated"
        static let az = "A → Z"
        static let za = "Z → A"
    }

    enum CardSort {
        static let updated = "Last updated"
        static let az = "A → Z"
        static let za = "Z → A"
    }

    enum DeckDetail {
        static let backToDecks = "Back to decks"
        static let study = "Study"
        static let addCard = "Add Card"
        static let emptyCardsTitle = "No cards yet"
        static let emptyCardsDescription = "Add your first card to start studying this deck."
        static let addFirstCard = "Add your first card"
        static let fieldFront = "Front"
        static let fieldBack = "Back"
    }

    enum AddCard {
        static let title = "Add New Card"
        static let description =
            "Create a new flashcard for this deck. Add content for both the front and back of the card."
        static let frontPlaceholder = "Front of the card"
        static let backPlaceholder = "Back of the card"
        static let creating = "Creating…"
        static let createCard = "Create Card"
        static let triggerDefault = "Add Card"
    }

    enum EditCard {
        static let title = "Edit Card"
        static let description = "Update the front and back of this flashcard."
        static let frontPlaceholder = "Front of the card"
        static let backPlaceholder = "Back of the card"
    }

    enum DeleteCard {
        static let title = "Delete card?"
        static let description = "This action cannot be undone. The card will be permanently deleted."
        static let deleting = "Deleting…"
        static let deleteCard = "Delete card"
    }

    enum StudyPage {
        static func title(_ name: String) -> String { "Study: \(name)" }
        static func backToDeck(_ name: String) -> String { "Back to \(name)" }
    }

    enum StudyClient {
        static let emptyTitle = "No cards in this deck"
        static let emptyDescription = "Add some cards to start studying."
        static let sessionComplete = "Session complete!"
        static func studiedAll(count: Int) -> String {
            count == 1 ? "You studied 1 card." : "You studied all \(count) cards."
        }
        static let correct = "Correct"
        static let incorrect = "Incorrect"
        static let score = "Score"
        static func skipped(count: Int) -> String {
            count == 1
                ? "1 card was skipped without a rating."
                : "\(count) cards were skipped without a rating."
        }
        static let savingResults = "Saving results…"
        static let saveFailed = "Failed to save results."
        static let shuffleRestart = "Shuffle & restart"
        static let restart = "Restart"
        static let shuffle = "Shuffle"
        static let flipHint = "Tap to flip"
        static let didYouGetIt = "Did you get it right?"
        static let previous = "Previous"
        static let nope = "Nope"
        static let gotIt = "Got it"
        static let next = "Next"
        static let revealFinish = "Reveal & Finish"
        static let keyboardHints = "Tap the card to flip"
    }

    enum Analytics {
        static let title = "Analytics"
        static let subtitle = "A record of all your study sessions."
        static let emptyTitle = "No sessions yet"
        static let emptyDescription = "Complete a study session to start tracking your progress here."
        static let goStudy = "Go study a deck"
        static let colDeck = "Deck"
        static let colTotalCards = "Cards"
        static let colCorrect = "✓"
        static let colScore = "Score"
    }

    enum CreateDeck {
        static let triggerDefault = "New Deck"
        static let createFirstDeck = "Create your first deck"
        static let dialogTitle = "Create a new deck"
        static let dialogDescription = "Give your deck a name and an optional description."
        static let namePlaceholder = "e.g. Spanish Vocabulary"
        static let descriptionPlaceholder = "What is this deck about?"
        static let creating = "Creating…"
        static let createDeck = "Create deck"
        static let limitTitle = "Deck limit reached"
        static let limitDescription =
            "Free plans are limited to 3 decks. Upgrade to Pro for unlimited decks and more."
        static let viewPlans = "View Plans"
    }

    enum EditDeck {
        static let title = "Edit Deck"
        static let description = "Update the name and description of this deck."
        static let namePlaceholder = "Deck name"
        static let descriptionPlaceholder = "Optional description"
    }

    enum DeleteDeck {
        static func title(_ name: String) -> String { "Delete «\(name)»?" }
        static func description(cardCount: Int) -> String {
            switch cardCount {
            case 0:
                return "This cannot be undone. The deck will be removed from your library. There are no cards in this deck."
            case 1:
                return "This cannot be undone. The deck will be removed from your library. The 1 card in this deck will be permanently deleted."
            default:
                return "This cannot be undone. The deck will be removed from your library. All \(cardCount) cards in this deck will be permanently deleted."
            }
        }
        static let deleteDeck = "Delete deck"
        static let deleting = "Deleting…"
    }

    enum Actions {
        static let deckLimitReached =
            "You've reached the 3-deck limit on the free plan. Upgrade to Pro for unlimited decks."
        static let saveDeckFailed = "Failed to save the deck. Please try again."
        static let deckNotFound = "Deck not found"
        static let cardNotFound = "Card not found"
        static let unauthorized = "Unauthorized"
    }

    enum Extension {
        static let loading = "Loading…"
    }
}
