import Foundation

/// English UI strings (PR-6 will migrate to `Localizable.xcstrings`).
enum L10n {
    enum Common {
        static let cancel = "Cancel"
        static let save = "Save changes"
        static let saving = "Saving…"
        static let edit = "Edit"
        static let delete = "Delete"
        static let tryAgain = "Something went wrong. Try again."
        static func deckLimitBanner(used: Int, limit: Int) -> String {
            "\(used)/\(limit) decks used"
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
        static let descriptionEmpty = "This cannot be undone. The deck will be removed from your library. There are no cards in this deck."
        static let deleteDeck = "Delete deck"
        static let deleting = "Deleting…"
    }

    enum DeckDetail {
        static let backToDecks = "Back to decks"
        static let placeholderTitle = "Deck detail"
        static let placeholderBody = "Card list and study mode ship in PR-4."
    }

    enum Actions {
        static let deckLimitReached =
            "You've reached the 3-deck limit on the free plan. Upgrade to Pro for unlimited decks."
        static let saveDeckFailed = "Failed to save the deck. Please try again."
        static let deckNotFound = "Deck not found"
        static let unauthorized = "Unauthorized"
    }

    enum Extension {
        static let loading = "Loading…"
    }
}
