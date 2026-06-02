import Foundation

struct CardsService {
    private let client: APIClient

    init(client: APIClient) {
        self.client = client
    }

    func list(deckUuid: String, pagination: PaginationParams? = nil) async throws -> PaginatedResponse<Card> {
        try await client.requestPaginated("/api/decks/\(deckUuid)/cards", pagination: pagination)
    }

    func get(deckUuid: String, cardUuid: String) async throws -> Card {
        try await client.requestData("/api/decks/\(deckUuid)/cards/\(cardUuid)")
    }

    func create(deckUuid: String, input: CreateCardInput) async throws -> Card {
        try await client.requestData("/api/decks/\(deckUuid)/cards", method: "POST", body: input)
    }

    func replace(deckUuid: String, cardUuid: String, input: ReplaceCardInput) async throws -> Card {
        try await client.requestData(
            "/api/decks/\(deckUuid)/cards/\(cardUuid)",
            method: "PUT",
            body: input
        )
    }

    func patch(deckUuid: String, cardUuid: String, input: PatchCardInput) async throws -> Card {
        try await client.requestData(
            "/api/decks/\(deckUuid)/cards/\(cardUuid)",
            method: "PATCH",
            body: input
        )
    }

    func delete(deckUuid: String, cardUuid: String) async throws -> Card {
        try await client.requestData("/api/decks/\(deckUuid)/cards/\(cardUuid)", method: "DELETE")
    }

    func listRatings(deckUuid: String, pagination: PaginationParams? = nil) async throws -> PaginatedResponse<RatingAggregate> {
        try await client.requestPaginated("/api/decks/\(deckUuid)/ratings", pagination: pagination)
    }
}
