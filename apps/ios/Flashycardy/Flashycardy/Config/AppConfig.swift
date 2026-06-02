import Foundation

/// Build-time configuration from xcconfig → Info.plist (see `apps/ios/Config/`).
enum AppConfig {
    static var clerkPublishableKey: String {
        string(for: "ClerkPublishableKey", fallback: "")
    }

    static var apiBaseURL: URL {
        let raw = string(for: "APIBaseURL", fallback: "http://127.0.0.1:3000")
        guard let url = URL(string: raw), url.scheme != nil else {
            preconditionFailure("Invalid APIBaseURL in build configuration: \(raw)")
        }
        return url
    }

    static var clerkFrontendAPIHost: String {
        string(for: "ClerkFrontendAPIHost", fallback: "")
    }

    /// OAuth redirect for Clerk native flows (must match URL scheme in Info.plist).
    static let oauthCallbackScheme = "local.Flashycardy"

    static var oauthRedirectURL: String {
        "\(oauthCallbackScheme)://callback"
    }

    private static func string(for key: String, fallback: String) -> String {
        guard let value = Bundle.main.object(forInfoDictionaryKey: key) as? String else {
            return fallback
        }
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty || trimmed.hasPrefix("$(") {
            return fallback
        }
        return trimmed
    }
}
