import Foundation

enum ApiErrorMessage {
    static func message(for error: Error) -> String {
        guard let apiError = error as? ApiError else {
            return error.localizedDescription
        }

        switch apiError.message {
        case "Deck limit reached for the free plan":
            return L10n.Actions.deckLimitReached
        case "Document-based deck generation requires a Pro plan":
            return L10n.Actions.documentDeckProRequired
        case "AI flashcard generation requires a Pro plan":
            return L10n.Actions.aiGenProRequired
        case "Add a description to your deck before generating cards":
            return L10n.Actions.addDescriptionFirst
        case "Failed to generate cards. Please try again":
            return L10n.Actions.generateCardsFailed
        case "Failed to save the deck. Please try again.", "Failed to save the deck":
            return L10n.Actions.saveDeckFailed
        case "Deck not found":
            return L10n.Actions.deckNotFound
        case "Card not found":
            return L10n.Actions.cardNotFound
        case "Unauthorized":
            return L10n.Actions.unauthorized
        case "Unsupported file type. Upload a .pdf, .docx, or .pptx file":
            return L10n.Actions.unsupportedFileType
        case "File must be non-empty and at most 10 MB":
            return L10n.Actions.fileSizeExceeded
        default:
            return apiError.message
        }
    }

    static func isDeckLimitError(_ error: Error) -> Bool {
        guard let apiError = error as? ApiError else { return false }
        return apiError.statusCode == 403 && apiError.message.contains("Deck limit")
    }
}
