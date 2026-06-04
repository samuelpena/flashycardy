import Foundation

/// Row returned by `GET /api/decks` (includes aggregated `cardCount`, omits `id` / `clerkUserId`).
struct DeckListItem: Codable, Equatable, Identifiable, Sendable {
    let uuid: String
    let name: String
    let description: String?
    let createdAt: String
    let updatedAt: String
    let cardCount: Int

    var id: String { uuid }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        uuid = try container.decode(String.self, forKey: .uuid)
        name = try container.decode(String.self, forKey: .name)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        createdAt = try Self.decodeDateString(from: container, forKey: .createdAt)
        updatedAt = try Self.decodeDateString(from: container, forKey: .updatedAt)
        cardCount = try Self.decodeInt(from: container, forKey: .cardCount)
    }

    private enum CodingKeys: String, CodingKey {
        case uuid
        case name
        case description
        case createdAt
        case updatedAt
        case cardCount
    }

    private static func decodeDateString(
        from container: KeyedDecodingContainer<CodingKeys>,
        forKey key: CodingKeys
    ) throws -> String {
        if let string = try? container.decode(String.self, forKey: key) {
            return string
        }
        // Postgres timestamps may arrive as JSON numbers (epoch ms) in some clients.
        if let ms = try? container.decode(Double.self, forKey: key) {
            return ISO8601DateFormatter().string(from: Date(timeIntervalSince1970: ms / 1000))
        }
        throw DecodingError.dataCorruptedError(forKey: key, in: container, debugDescription: "Expected date string")
    }

    private static func decodeInt(
        from container: KeyedDecodingContainer<CodingKeys>,
        forKey key: CodingKeys
    ) throws -> Int {
        if let value = try? container.decode(Int.self, forKey: key) {
            return value
        }
        if let raw = try? container.decode(String.self, forKey: key), let value = Int(raw) {
            return value
        }
        return 0
    }
}

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
