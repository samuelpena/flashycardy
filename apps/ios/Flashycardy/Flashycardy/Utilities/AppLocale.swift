import Foundation

enum AppLocale: String, CaseIterable, Identifiable, Sendable {
    case en
    case es

    var id: String { rawValue }

    var locale: Locale {
        Locale(identifier: rawValue)
    }

    static func normalize(_ raw: String?) -> AppLocale {
        raw == "es" ? .es : .en
    }
}
