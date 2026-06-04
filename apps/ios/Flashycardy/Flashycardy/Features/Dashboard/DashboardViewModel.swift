import Foundation
import Observation

@MainActor
@Observable
final class DashboardViewModel {
    private(set) var decks: [DeckListItem] = []
    private(set) var sessionCounts: [String: Int] = [:]
    private(set) var isLoading = true
    private(set) var errorMessage: String?

    var sort: DeckSortOption = .updated
    var currentPage = 1

    private let api: FlashycardyAPI

    init(api: FlashycardyAPI) {
        self.api = api
    }

    var showDeckLimitBanner: Bool {
        decks.count >= AppConstants.freeDeckLimit
    }

    var sortedDecks: [DeckListItem] {
        decks.sorted { lhs, rhs in
            switch sort {
            case .az:
                lhs.name.localizedCompare(rhs.name) == .orderedAscending
            case .za:
                lhs.name.localizedCompare(rhs.name) == .orderedDescending
            case .updated:
                (ISO8601DateParser.parse(rhs.updatedAt) ?? .distantPast)
                    > (ISO8601DateParser.parse(lhs.updatedAt) ?? .distantPast)
            }
        }
    }

    var totalPages: Int {
        max(1, Int(ceil(Double(sortedDecks.count) / Double(AppConstants.dashboardPageSize))))
    }

    var safePage: Int {
        min(max(1, currentPage), totalPages)
    }

    var paginatedDecks: [DeckListItem] {
        let start = (safePage - 1) * AppConstants.dashboardPageSize
        let end = min(start + AppConstants.dashboardPageSize, sortedDecks.count)
        guard start < end else { return [] }
        return Array(sortedDecks[start..<end])
    }

    func sessionCount(for deckUuid: String) -> Int {
        sessionCounts[deckUuid] ?? 0
    }

    func load() async {
        isLoading = true
        errorMessage = nil

        do {
            let loadedDecks = try await FetchAllPages.fetch { pagination in
                try await self.api.decks.list(pagination: pagination)
            }
            decks = loadedDecks

            do {
                let counts = try await FetchAllPages.fetch { pagination in
                    try await self.api.studySessions.listCountsByDeck(pagination: pagination)
                }
                sessionCounts = Dictionary(uniqueKeysWithValues: counts.map { ($0.deckUuid, $0.sessionCount) })
            } catch {
                // Session counts are optional for the dashboard grid.
                sessionCounts = [:]
            }
        } catch {
            errorMessage = LoadErrorMessage.userFacing(error)
        }

        isLoading = false
    }

    func reload() async {
        await load()
    }

    func setSort(_ option: DeckSortOption) {
        sort = option
        currentPage = 1
    }

    func goToPage(_ page: Int) {
        currentPage = min(max(1, page), totalPages)
    }
}
