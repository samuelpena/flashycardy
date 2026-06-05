import Foundation

struct StudySessionDeck: Codable, Equatable, Sendable {
    let uuid: String
    let name: String
}

struct StudySession: Codable, Equatable, Identifiable, Sendable {
    let id: Int
    let uuid: String
    let clerkUserId: String
    let deckId: Int
    let totalCards: Int
    let correctCount: Int
    let incorrectCount: Int
    let completedAt: String
    let deck: StudySessionDeck?
}

struct StudySessionCountByDeck: Codable, Equatable, Sendable {
    let deckUuid: String
    let sessionCount: Int

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        deckUuid = try container.decode(String.self, forKey: .deckUuid)
        if let count = try? container.decode(Int.self, forKey: .sessionCount) {
            sessionCount = count
        } else if let raw = try? container.decode(String.self, forKey: .sessionCount),
                  let count = Int(raw) {
            sessionCount = count
        } else {
            sessionCount = 0
        }
    }

    private enum CodingKeys: String, CodingKey {
        case deckUuid
        case sessionCount
    }
}

struct StudySessionCardResult: Codable, Equatable, Sendable {
    let cardUuid: String
    let isCorrect: Bool
}
