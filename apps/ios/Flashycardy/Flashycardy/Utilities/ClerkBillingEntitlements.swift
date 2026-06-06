import ClerkKit
import Foundation

/// Billing entitlements from Clerk session JWT v2 claims (`fea`, `pla`).
struct ClerkBillingEntitlements: Equatable {
    /// `true` when `unlimited_decks` is present; `false` when `3_deck_limit` is present; `nil` when unknown.
    let hasUnlimitedDecks: Bool?
    let hasDocumentDeckGeneration: Bool
    let hasAiFlashcardGeneration: Bool

    static let unknown = ClerkBillingEntitlements(
        hasUnlimitedDecks: nil,
        hasDocumentDeckGeneration: false,
        hasAiFlashcardGeneration: false
    )

    @MainActor
    static func current(clerk: Clerk) async -> ClerkBillingEntitlements {
        guard let token = try? await ClerkSessionToken.bearerToken(clerk: clerk) else {
            return .unknown
        }
        return fromSessionToken(token)
    }

    static func fromSessionToken(_ token: String) -> ClerkBillingEntitlements {
        guard let payload = SessionJWTPayload.decode(token) else {
            return .unknown
        }
        let features = parseFeatureSlugs(from: payload["fea"])
        let hasUnlimitedDecks: Bool? = if features.contains("unlimited_decks") {
            true
        } else if features.contains("3_deck_limit") {
            false
        } else {
            nil
        }
        return ClerkBillingEntitlements(
            hasUnlimitedDecks: hasUnlimitedDecks,
            hasDocumentDeckGeneration: features.contains("document_deck_generation"),
            hasAiFlashcardGeneration: features.contains("ai_flashcard_generation")
        )
    }

    static func parseFeatureSlugs(from fea: Any?) -> Set<String> {
        guard let feaString = fea as? String, !feaString.isEmpty else { return [] }

        var slugs = Set<String>()
        for entry in feaString.split(separator: ",") {
            let trimmed = entry.trimmingCharacters(in: .whitespaces)
            guard !trimmed.isEmpty else { continue }
            if let colon = trimmed.firstIndex(of: ":") {
                slugs.insert(String(trimmed[trimmed.index(after: colon)...]))
            } else {
                slugs.insert(trimmed)
            }
        }
        return slugs
    }
}

enum SessionJWTPayload {
    static func decode(_ jwt: String) -> [String: Any]? {
        let parts = jwt.split(separator: ".", omittingEmptySubsequences: false)
        guard parts.count >= 2,
              let data = base64URLDecode(String(parts[1])),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            return nil
        }
        return json
    }

    private static func base64URLDecode(_ value: String) -> Data? {
        var base64 = value
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        let remainder = base64.count % 4
        if remainder > 0 {
            base64 += String(repeating: "=", count: 4 - remainder)
        }
        return Data(base64Encoded: base64)
    }
}
