import Foundation

struct DecksService {
    private let client: APIClient

    init(client: APIClient) {
        self.client = client
    }

    func list(pagination: PaginationParams? = nil) async throws -> PaginatedResponse<Deck> {
        try await client.requestPaginated("/api/decks", pagination: pagination)
    }

    func count() async throws -> DeckCount {
        try await client.requestData("/api/decks/count")
    }

    func get(deckUuid: String, pagination: PaginationParams? = nil) async throws -> DataWithPagination<DeckWithCards> {
        try await client.requestDataWithPagination("/api/decks/\(deckUuid)", pagination: pagination)
    }

    func create(_ input: CreateDeckInput) async throws -> Deck {
        try await client.requestData("/api/decks", method: "POST", body: input)
    }

    func replace(deckUuid: String, input: ReplaceDeckInput) async throws -> Deck {
        try await client.requestData("/api/decks/\(deckUuid)", method: "PUT", body: input)
    }

    func patch(deckUuid: String, input: PatchDeckInput) async throws -> Deck {
        try await client.requestData("/api/decks/\(deckUuid)", method: "PATCH", body: input)
    }

    func delete(deckUuid: String) async throws -> Deck {
        try await client.requestData("/api/decks/\(deckUuid)", method: "DELETE")
    }

    func generateCards(deckUuid: String) async throws -> GenerateCardsResult {
        try await client.requestData("/api/decks/\(deckUuid)/generate-cards", method: "POST")
    }

    func createFromDocument(_ input: CreateDeckFromDocumentInput) async throws -> CreateDeckFromDocumentResult {
        try await client.requestData("/api/decks/from-document", method: "POST", body: input)
    }

    func createFromPage(_ input: CreateDeckFromPageInput) async throws -> CreateDeckFromDocumentResult {
        try await client.requestData("/api/decks/from-page", method: "POST", body: input)
    }
}
