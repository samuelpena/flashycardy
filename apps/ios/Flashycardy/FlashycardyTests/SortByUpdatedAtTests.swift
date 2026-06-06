import XCTest
@testable import Flashycardy

final class SortByUpdatedAtTests: XCTestCase {
    func testIsDescendingOrdersNewestFirst() {
        let newer = "2024-06-02T00:00:00.000Z"
        let older = "2024-06-01T00:00:00.000Z"

        XCTAssertTrue(SortByUpdatedAt.isDescending(lhs: newer, rhs: older))
        XCTAssertFalse(SortByUpdatedAt.isDescending(lhs: older, rhs: newer))
    }

    func testSortedCardsUseDescendingUpdatedAt() {
        let cards = [
            Card(id: 1, uuid: "a", deckId: 1, front: "A", back: "A", createdAt: older, updatedAt: older),
            Card(id: 2, uuid: "b", deckId: 1, front: "B", back: "B", createdAt: newer, updatedAt: newer),
        ]

        let sorted = cards.sorted { SortByUpdatedAt.isDescending(lhs: $0.updatedAt, rhs: $1.updatedAt) }
        XCTAssertEqual(sorted.map(\.uuid), ["b", "a"])
    }

    private let older = "2024-06-01T00:00:00.000Z"
    private let newer = "2024-06-02T00:00:00.000Z"
}

final class ISO8601DateParserTests: XCTestCase {
    func testParsesApiTimestampWithFractionalSeconds() {
        let date = ISO8601DateParser.parse("2024-01-01T00:00:00.000Z")
        XCTAssertNotNil(date)
    }

    func testParsesDateOnlyTimestamp() {
        let date = ISO8601DateParser.parse("2024-01-01")
        XCTAssertNotNil(date)
    }
}
