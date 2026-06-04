import Foundation

enum DeckSortOption: String, CaseIterable, Identifiable {
    case updated
    case az
    case za

    var id: String { rawValue }

    var label: String {
        switch self {
        case .updated: L10n.DeckSort.updated
        case .az: L10n.DeckSort.az
        case .za: L10n.DeckSort.za
        }
    }
}
