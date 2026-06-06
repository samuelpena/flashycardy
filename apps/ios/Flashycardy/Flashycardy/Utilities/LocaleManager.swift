import ClerkKit
import Foundation
import Observation

@MainActor
@Observable
final class LocaleManager {
    static let guestLocaleKey = "flashycardy.guestLocale"

    private(set) var appLocale: AppLocale = .en

    var locale: Locale {
        appLocale.locale
    }

    func sync(from clerk: Clerk) {
        if let user = clerk.user {
            appLocale = Self.language(from: user)
        } else if let stored = UserDefaults.standard.string(forKey: Self.guestLocaleKey) {
            appLocale = AppLocale.normalize(stored)
        } else {
            appLocale = .en
        }
    }

    func save(language: AppLocale, clerk: Clerk) async throws {
        if let user = clerk.user {
            var metadata: [String: JSON] = [:]
            if case .object(let existing)? = user.unsafeMetadata {
                metadata = existing
            }
            metadata["language"] = .string(language.rawValue)
            _ = try await user.update(.init(unsafeMetadata: .object(metadata)))
            try await user.reload()
        } else {
            UserDefaults.standard.set(language.rawValue, forKey: Self.guestLocaleKey)
        }
        appLocale = language
    }

    static func language(from user: User) -> AppLocale {
        guard case .object(let metadata)? = user.unsafeMetadata,
              case .string(let raw)? = metadata["language"] else {
            return .en
        }
        return AppLocale.normalize(raw)
    }
}
