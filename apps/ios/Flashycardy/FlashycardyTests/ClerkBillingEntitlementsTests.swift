import XCTest
@testable import Flashycardy

final class ClerkBillingEntitlementsTests: XCTestCase {
    func testParseFeatureSlugsFromFeaClaim() {
        let slugs = ClerkBillingEntitlements.parseFeatureSlugs(
            from: "u:unlimited_decks,u:document_deck_generation,u:ai_flashcard_generation"
        )
        XCTAssertTrue(slugs.contains("unlimited_decks"))
        XCTAssertTrue(slugs.contains("document_deck_generation"))
        XCTAssertTrue(slugs.contains("ai_flashcard_generation"))
    }

    func testFromSessionTokenDetectsUnlimitedDecksForProUser() throws {
        let token = try Self.makeTestJWT(
            payload: [
                "fea": "u:unlimited_decks,u:document_deck_generation,u:ai_flashcard_generation",
                "pla": "u:pro",
            ]
        )

        let entitlements = ClerkBillingEntitlements.fromSessionToken(token)

        XCTAssertEqual(entitlements.hasUnlimitedDecks, true)
        XCTAssertTrue(entitlements.hasDocumentDeckGeneration)
        XCTAssertTrue(entitlements.hasAiFlashcardGeneration)
    }

    func testFromSessionTokenTreatsFreeUserAsLimited() throws {
        let token = try Self.makeTestJWT(
            payload: [
                "fea": "u:3_deck_limit",
                "pla": "u:free_user",
            ]
        )

        let entitlements = ClerkBillingEntitlements.fromSessionToken(token)

        XCTAssertEqual(entitlements.hasUnlimitedDecks, false)
        XCTAssertFalse(entitlements.hasDocumentDeckGeneration)
        XCTAssertFalse(entitlements.hasAiFlashcardGeneration)
    }

    func testFromSessionTokenReturnsUnknownForMalformedJWT() {
        let entitlements = ClerkBillingEntitlements.fromSessionToken("not-a-jwt")
        XCTAssertNil(entitlements.hasUnlimitedDecks)
    }

    func testFromSessionTokenReturnsUnknownWhenFeaturesMissing() throws {
        let token = try Self.makeTestJWT(payload: ["sub": "user_123"])
        let entitlements = ClerkBillingEntitlements.fromSessionToken(token)
        XCTAssertNil(entitlements.hasUnlimitedDecks)
    }

    private static func makeTestJWT(payload: [String: Any]) throws -> String {
        let headerData = try JSONSerialization.data(withJSONObject: ["alg": "none", "typ": "JWT"])
        let payloadData = try JSONSerialization.data(withJSONObject: payload)
        let header = base64URLEncode(headerData)
        let body = base64URLEncode(payloadData)
        return "\(header).\(body).signature"
    }

    private static func base64URLEncode(_ data: Data) -> String {
        data.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}
