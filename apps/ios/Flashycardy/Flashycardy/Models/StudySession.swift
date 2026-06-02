import Foundation

struct StudySession: Codable, Equatable, Identifiable, Sendable {
    let id: Int
    let uuid: String
    let clerkUserId: String
    let deckId: Int
    let totalCards: Int
    let correctCount: Int
    let incorrectCount: Int
    let completedAt: String
    let deck: Deck?
}

struct StudySessionCountByDeck: Codable, Equatable, Sendable {
    let deckUuid: String
    let sessionCount: Int
}

struct StudySessionCardResult: Codable, Equatable, Sendable {
    let cardUuid: String
    let isCorrect: Bool
}
