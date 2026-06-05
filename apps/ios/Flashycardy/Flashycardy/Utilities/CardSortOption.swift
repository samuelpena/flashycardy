import Foundation

enum CardSortOption: String, CaseIterable, Identifiable {
    case updated
    case az
    case za

    var id: String { rawValue }

    var label: String {
        switch self {
        case .updated: L10n.CardSort.updated
        case .az: L10n.CardSort.az
        case .za: L10n.CardSort.za
        }
    }
}
