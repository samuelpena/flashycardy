import Foundation

struct CreateDeckInput: Encodable, Sendable {
    let name: String
    var description: String?
    var cards: [CreateCardPayload]?
}

struct CreateCardPayload: Encodable, Sendable {
    let front: String
    let back: String
}

struct CreateDeckFromDocumentInput: Encodable, Sendable {
    let fileBase64: String
    let fileName: String
}

struct CreateDeckFromPageInput: Encodable, Sendable {
    let pageText: String
    var pageUrl: String?
    var pageTitle: String?
}

struct CreateCardInput: Encodable, Sendable {
    let front: String
    let back: String
}

struct ReplaceDeckInput: Encodable, Sendable {
    let name: String
    var description: String?
}

struct PatchDeckInput: Encodable, Sendable {
    var name: String?
    var description: String?
}

struct ReplaceCardInput: Encodable, Sendable {
    let front: String
    let back: String
}

struct PatchCardInput: Encodable, Sendable {
    var front: String?
    var back: String?
}

struct CreateStudySessionInput: Encodable, Sendable {
    let deckUuid: String
    let cardResults: [StudySessionCardResult]
}
