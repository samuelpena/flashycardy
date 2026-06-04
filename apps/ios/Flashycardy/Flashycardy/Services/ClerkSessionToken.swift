import ClerkKit
import Foundation

enum ClerkSessionToken {
    /// Returns a Clerk **session** JWT for `Authorization: Bearer` (required by `apps/web` REST auth).
    @MainActor
    static func bearerToken(clerk: Clerk) async throws -> String? {
        if let token = try await clerk.auth.getToken(.init(skipCache: true)), !token.isEmpty {
            return token
        }

        if let session = clerk.session {
            let token = try await session.getToken(.init(skipCache: true))
            if let token, !token.isEmpty {
                return token
            }
        }

        return nil
    }
}
