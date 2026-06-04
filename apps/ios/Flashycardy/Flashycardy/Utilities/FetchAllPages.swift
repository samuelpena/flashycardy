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
            if page >= response.meta.totalPages { break }
            page += 1
        }

        return items
    }
}
