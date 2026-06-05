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

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        cardUuid = try container.decode(String.self, forKey: .cardUuid)
        correctCount = Self.decodeInt(from: container, forKey: .correctCount)
        incorrectCount = Self.decodeInt(from: container, forKey: .incorrectCount)
    }

    private enum CodingKeys: String, CodingKey {
        case cardUuid
        case correctCount
        case incorrectCount
    }

    private static func decodeInt(
        from container: KeyedDecodingContainer<CodingKeys>,
        forKey key: CodingKeys
    ) -> Int {
        if let value = try? container.decode(Int.self, forKey: key) {
            return value
        }
        if let raw = try? container.decode(String.self, forKey: key), let value = Int(raw) {
            return value
        }
        return 0
    }
}
