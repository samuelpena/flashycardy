import Foundation

struct PaginationParams: Equatable, Sendable {
    var page: Int?
    var pageSize: Int?
}

struct PaginationMeta: Codable, Equatable, Sendable {
    let totalItems: Int
    let perPage: Int
    let totalPages: Int
    let currentPage: Int

    enum CodingKeys: String, CodingKey {
        case totalItems = "total_items"
        case perPage = "per_page"
        case totalPages = "total_pages"
        case currentPage = "current_page"
    }
}

struct PaginationLinks: Codable, Equatable, Sendable {
    let next: String?
    let prev: String?
    let first: String
    let last: String
}

struct PaginatedResponse<T> {
    let data: [T]
    let meta: PaginationMeta
    let links: PaginationLinks
}

struct DataWithPagination<T> {
    let data: T
    let meta: PaginationMeta
    let links: PaginationLinks
}
