import XCTest
@testable import Flashycardy

final class APIClientTests: XCTestCase {
    func testBuildQueryStringIncludesPageAndPageSize() {
        let query = APIClientTestSupport.buildQueryString(page: 2, pageSize: 9)
        XCTAssertEqual(query, "?page=2&pageSize=9")
    }

    func testBuildQueryStringEmptyWhenNoParams() {
        XCTAssertEqual(APIClientTestSupport.buildQueryString(page: nil, pageSize: nil), "")
    }

    func testDecodesDataEnvelope() throws {
        let json = """
        {"data":{"count":3}}
        """
        let envelope = try JSONDecoder().decode(DeckCountEnvelope.self, from: Data(json.utf8))
        XCTAssertEqual(envelope.data?.count, 3)
    }

    func testDecodesPaginatedEnvelope() throws {
        let json = """
        {
          "data":[{"uuid":"d1","id":1,"clerkUserId":"u","name":"Deck","description":null,"createdAt":"2024-01-01","updatedAt":"2024-01-01"}],
          "meta":{"total_items":1,"per_page":20,"total_pages":1,"current_page":1},
          "links":{"next":null,"prev":null,"first":"http://localhost/api/decks?page=1","last":"http://localhost/api/decks?page=1"}
        }
        """
        let envelope = try JSONDecoder().decode(DeckListEnvelope.self, from: Data(json.utf8))
        XCTAssertEqual(envelope.data?.count, 1)
        XCTAssertEqual(envelope.meta?.totalItems, 1)
        XCTAssertTrue(envelope.links?.first.contains("/api/decks") == true)
    }

    func testDecodesErrorEnvelope() throws {
        let json = #"{"error":"Unauthorized"}"#
        let envelope = try JSONDecoder().decode(ErrorOnlyEnvelope.self, from: Data(json.utf8))
        XCTAssertEqual(envelope.error, "Unauthorized")
    }

    func testApiErrorDescription() {
        let error = ApiError(statusCode: 403, message: "Deck limit reached for the free plan")
        XCTAssertEqual(error.statusCode, 403)
        XCTAssertTrue(error.message.contains("Deck limit"))
    }
}

private struct DeckCountEnvelope: Decodable {
    let data: DeckCount?
}

private struct DeckListEnvelope: Decodable {
    let data: [Deck]?
    let meta: PaginationMeta?
    let links: PaginationLinks?
}

private struct ErrorOnlyEnvelope: Decodable {
    let error: String?
}
