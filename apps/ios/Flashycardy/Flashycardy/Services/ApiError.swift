import Foundation

/// Thrown when the API returns a non-2xx response or malformed envelope.
struct ApiError: Error, Equatable, Sendable {
    let statusCode: Int
    let message: String

    init(statusCode: Int, message: String) {
        self.statusCode = statusCode
        self.message = message
    }
}

extension ApiError: LocalizedError {
    var errorDescription: String? { message }
}
