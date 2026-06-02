import Foundation

struct Deck: Codable, Equatable, Identifiable, Sendable {
    let id: Int
    let uuid: String
    let clerkUserId: String
    let name: String
    let description: String?
    let createdAt: String
    let updatedAt: String
}

struct DeckWithCards: Codable, Equatable, Sendable {
    let id: Int
    let uuid: String
    let clerkUserId: String
    let name: String
    let description: String?
    let createdAt: String
    let updatedAt: String
    let cards: [Card]
}

struct DeckCount: Codable, Equatable, Sendable {
    let count: Int
}

struct CreateDeckFromDocumentResult: Codable, Equatable, Sendable {
    let deckUuid: String
}

struct GenerateCardsResult: Codable, Equatable, Sendable {
    let success: Bool
}
