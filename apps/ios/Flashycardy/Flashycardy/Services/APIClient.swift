import Foundation

struct APIClientConfiguration: Sendable {
    let baseURL: URL
    let getToken: @Sendable () async throws -> String?

    init(baseURL: URL, getToken: @escaping @Sendable () async throws -> String?) {
        self.baseURL = baseURL
        self.getToken = getToken
    }
}

/// Typed HTTP client for the FlashyCardy REST API (mirrors `@flashycardy/api-client`).
actor APIClient {
    private let baseURL: URL
    private let getToken: @Sendable () async throws -> String?
    private let session: URLSession
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder

    init(configuration: APIClientConfiguration, session: URLSession = .shared) {
        self.baseURL = configuration.baseURL
        self.getToken = configuration.getToken
        self.session = session
        self.encoder = JSONEncoder()
        self.decoder = JSONDecoder()
    }

    func requestData<T: Decodable>(
        _ path: String,
        method: String = "GET",
        body: (any Encodable)? = nil
    ) async throws -> T {
        let envelope: DataEnvelope<T> = try await requestJSON(path, method: method, body: body)
        guard let data = envelope.data else {
            throw ApiError(statusCode: 500, message: "Invalid response envelope")
        }
        return data
    }

    func requestPaginated<T: Decodable>(
        _ path: String,
        pagination: PaginationParams? = nil
    ) async throws -> PaginatedResponse<T> {
        let envelope: PaginatedEnvelope<T> = try await requestJSON(
            path,
            query: pagination
        )
        guard let data = envelope.data, let meta = envelope.meta, let links = envelope.links else {
            throw ApiError(statusCode: 500, message: "Missing pagination metadata")
        }
        return PaginatedResponse(data: data, meta: meta, links: links)
    }

    func requestDataWithPagination<T: Decodable>(
        _ path: String,
        pagination: PaginationParams? = nil
    ) async throws -> DataWithPagination<T> {
        let envelope: DataPaginatedEnvelope<T> = try await requestJSON(
            path,
            query: pagination
        )
        guard let data = envelope.data, let meta = envelope.meta, let links = envelope.links else {
            throw ApiError(statusCode: 500, message: "Missing pagination metadata")
        }
        return DataWithPagination(data: data, meta: meta, links: links)
    }

    // MARK: - Internal request helpers

    private func requestJSON<Envelope: Decodable>(
        _ path: String,
        method: String = "GET",
        query: PaginationParams? = nil,
        body: (any Encodable)? = nil
    ) async throws -> Envelope {
        let url = try buildURL(path: path, pagination: query)
        var request = URLRequest(url: url)
        request.httpMethod = method

        if let body {
            request.httpBody = try encoder.encode(AnyEncodable(body))
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        guard let token = try await getToken(), !token.isEmpty else {
            throw ApiError(statusCode: 401, message: "Unauthorized")
        }
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await session.data(for: request)
        let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 0

        if let apiError = try decodeApiError(data: data, statusCode: statusCode) {
            throw apiError
        }

        do {
            return try decoder.decode(Envelope.self, from: data)
        } catch {
            throw ApiError(statusCode: statusCode, message: "Failed to decode response")
        }
    }

    private func buildURL(path: String, pagination: PaginationParams?) throws -> URL {
        guard var components = URLComponents(
            url: baseURL.appending(path: path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))),
            resolvingAgainstBaseURL: false
        ) else {
            throw ApiError(statusCode: 0, message: "Invalid URL")
        }

        if let pagination {
            var items: [URLQueryItem] = []
            if let page = pagination.page {
                items.append(URLQueryItem(name: "page", value: String(page)))
            }
            if let pageSize = pagination.pageSize {
                items.append(URLQueryItem(name: "pageSize", value: String(pageSize)))
            }
            if !items.isEmpty {
                components.queryItems = items
            }
        }

        guard let url = components.url else {
            throw ApiError(statusCode: 0, message: "Invalid URL")
        }
        return url
    }

    private func decodeApiError(data: Data, statusCode: Int) throws -> ApiError? {
        if (200 ..< 300).contains(statusCode) {
            if let envelope = try? decoder.decode(ErrorEnvelope.self, from: data),
               let message = envelope.error {
                return ApiError(statusCode: statusCode, message: message)
            }
            return nil
        }

        if let envelope = try? decoder.decode(ErrorEnvelope.self, from: data),
           let message = envelope.error {
            return ApiError(statusCode: statusCode, message: message)
        }
        return ApiError(statusCode: statusCode, message: "Request failed")
    }
}

// MARK: - Response envelopes

private struct ErrorEnvelope: Decodable {
    let error: String?
}

private struct DataEnvelope<T: Decodable>: Decodable {
    let data: T?
    let error: String?
}

private struct PaginatedEnvelope<T: Decodable>: Decodable {
    let data: [T]?
    let meta: PaginationMeta?
    let links: PaginationLinks?
    let error: String?
}

private struct DataPaginatedEnvelope<T: Decodable>: Decodable {
    let data: T?
    let meta: PaginationMeta?
    let links: PaginationLinks?
    let error: String?
}

/// Type-erased encoding wrapper for request bodies.
private struct AnyEncodable: Encodable {
    private let encodeClosure: (Encoder) throws -> Void

    init(_ value: any Encodable) {
        encodeClosure = value.encode
    }

    func encode(to encoder: Encoder) throws {
        try encodeClosure(encoder)
    }
}

// MARK: - Test helpers

enum APIClientTestSupport {
    static func buildQueryString(page: Int?, pageSize: Int?) -> String {
        var items: [String] = []
        if let page { items.append("page=\(page)") }
        if let pageSize { items.append("pageSize=\(pageSize)") }
        guard !items.isEmpty else { return "" }
        return "?" + items.joined(separator: "&")
    }
}
