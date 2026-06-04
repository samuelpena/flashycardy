import Foundation

enum ApiErrorMessage {
    static func message(for error: Error) -> String {
        guard let apiError = error as? ApiError else {
            return error.localizedDescription
        }

        switch apiError.message {
        case "Deck limit reached for the free plan":
            return L10n.Actions.deckLimitReached
        case "Failed to save the deck. Please try again.":
            return L10n.Actions.saveDeckFailed
        case "Deck not found":
            return L10n.Actions.deckNotFound
        case "Unauthorized":
            return L10n.Actions.unauthorized
        default:
            return apiError.message
        }
    }

    static func isDeckLimitError(_ error: Error) -> Bool {
        guard let apiError = error as? ApiError else { return false }
        return apiError.statusCode == 403 && apiError.message.contains("Deck limit")
    }
}
