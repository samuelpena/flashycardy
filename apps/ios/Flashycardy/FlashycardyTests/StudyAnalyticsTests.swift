import XCTest
@testable import Flashycardy

@MainActor
final class StudyAnalyticsTests: XCTestCase {
    func testDecodesStudySessionWithDeck() throws {
        let json = """
        {
          "id": 42,
          "uuid": "sess-uuid",
          "clerkUserId": "user_1",
          "deckId": 7,
          "totalCards": 10,
          "correctCount": 8,
          "incorrectCount": 2,
          "completedAt": "2024-06-01T12:00:00.000Z",
          "deck": { "uuid": "deck-uuid", "name": "Spanish" }
        }
        """
        let session = try JSONDecoder().decode(StudySession.self, from: Data(json.utf8))
        XCTAssertEqual(session.id, 42)
        XCTAssertEqual(session.deck?.name, "Spanish")
        XCTAssertEqual(session.deck?.uuid, "deck-uuid")
    }

    func testAnalyticsScorePercent() {
        let session = StudySession(
            id: 1,
            uuid: "s1",
            clerkUserId: "u",
            deckId: 1,
            totalCards: 10,
            correctCount: 8,
            incorrectCount: 2,
            completedAt: "2024-01-01",
            deck: StudySessionDeck(uuid: "d1", name: "Deck")
        )
        XCTAssertEqual(AnalyticsViewModel.scorePercent(for: session), 80)
    }

    func testAnalyticsScorePercentHalfCorrect() {
        let session = StudySession(
            id: 1,
            uuid: "s1",
            clerkUserId: "u",
            deckId: 1,
            totalCards: 4,
            correctCount: 2,
            incorrectCount: 2,
            completedAt: "2024-01-01",
            deck: StudySessionDeck(uuid: "d1", name: "Deck")
        )
        XCTAssertEqual(AnalyticsViewModel.scorePercent(for: session), 50)
    }

    func testAnalyticsScorePercentEmptyDeck() {
        let session = StudySession(
            id: 1,
            uuid: "s1",
            clerkUserId: "u",
            deckId: 1,
            totalCards: 0,
            correctCount: 0,
            incorrectCount: 0,
            completedAt: "2024-01-01",
            deck: nil
        )
        XCTAssertEqual(AnalyticsViewModel.scorePercent(for: session), 0)
    }
}
