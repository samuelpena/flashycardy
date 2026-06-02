import Foundation

struct StudySessionsService {
    private let client: APIClient

    init(client: APIClient) {
        self.client = client
    }

    func list(pagination: PaginationParams? = nil) async throws -> PaginatedResponse<StudySession> {
        try await client.requestPaginated("/api/study-sessions", pagination: pagination)
    }

    func create(_ input: CreateStudySessionInput) async throws -> StudySession {
        try await client.requestData("/api/study-sessions", method: "POST", body: input)
    }

    func listCountsByDeck(pagination: PaginationParams? = nil) async throws -> PaginatedResponse<StudySessionCountByDeck> {
        try await client.requestPaginated("/api/study-sessions/counts", pagination: pagination)
    }
}
