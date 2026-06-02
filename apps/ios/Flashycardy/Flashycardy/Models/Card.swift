import Foundation

struct Card: Codable, Equatable, Identifiable, Sendable {
    let id: Int
    let uuid: String
    let deckId: Int
    let front: String
    let back: String
    let createdAt: String
    let updatedAt: String
}

struct RatingAggregate: Codable, Equatable, Sendable {
    let cardUuid: String
    let correctCount: Int
    let incorrectCount: Int
}
