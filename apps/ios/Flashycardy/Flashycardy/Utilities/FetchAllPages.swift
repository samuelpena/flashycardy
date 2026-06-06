import Foundation

enum FetchAllPages {
    /// Fetches every page from a paginated API helper (mirrors extension `fetchAllPages`).
    static func fetch<T>(
        pageSize: Int = 100,
        fetchPage: (PaginationParams) async throws -> PaginatedResponse<T>
    ) async throws -> [T] {
        var items: [T] = []
        var page = 1

        while true {
            let response = try await fetchPage(PaginationParams(page: page, pageSize: pageSize))
            items.append(contentsOf: response.data)
            if response.data.isEmpty { break }
            if response.links.next == nil { break }
            page += 1
        }

        return items
    }

    /// Loads deck metadata and every card page from `GET /api/decks/:uuid`.
    static func fetchDeckWithAllCards(
        fetchPage: (PaginationParams) async throws -> DataWithPagination<DeckWithCards>
    ) async throws -> (metadata: DeckWithCards, cards: [Card]) {
        var allCards: [Card] = []
        var metadata: DeckWithCards?
        var page = 1

        while true {
            let response = try await fetchPage(PaginationParams(page: page, pageSize: 100))
            if metadata == nil {
                metadata = DeckWithCards(
                    id: response.data.id,
                    uuid: response.data.uuid,
                    clerkUserId: response.data.clerkUserId,
                    name: response.data.name,
                    description: response.data.description,
                    createdAt: response.data.createdAt,
                    updatedAt: response.data.updatedAt,
                    cards: []
                )
            }
            allCards.append(contentsOf: response.data.cards)
            if response.data.cards.isEmpty { break }
            if response.links.next == nil { break }
            page += 1
        }

        guard let metadata else {
            throw ApiError(statusCode: 500, message: "Missing deck metadata")
        }

        return (metadata, allCards)
    }
}
