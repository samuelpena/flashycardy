import Foundation
import Observation

@MainActor
@Observable
final class DeckDetailViewModel {
    private(set) var deck: DeckWithCards?
    private(set) var allCards: [Card] = []
    private(set) var ratings: [String: RatingAggregate] = [:]
    private(set) var isLoading = true
    private(set) var errorMessage: String?

    var sort: CardSortOption = .updated
    var currentPage = 1

    let deckUuid: String
    private let api: FlashycardyAPI

    init(deckUuid: String, api: FlashycardyAPI) {
        self.deckUuid = deckUuid
        self.api = api
    }

    var deckReference: DeckReference? {
        guard let deck else { return nil }
        return DeckReference(metadata: deck, cardCount: allCards.count)
    }

    var sortedCards: [Card] {
        allCards.sorted { lhs, rhs in
            switch sort {
            case .az:
                lhs.front.localizedCompare(rhs.front) == .orderedAscending
            case .za:
                lhs.front.localizedCompare(rhs.front) == .orderedDescending
            case .updated:
                SortByUpdatedAt.isDescending(lhs: lhs.updatedAt, rhs: rhs.updatedAt)
            }
        }
    }

    var totalPages: Int {
        max(1, Int(ceil(Double(sortedCards.count) / Double(AppConstants.deckDetailPageSize))))
    }

    var safePage: Int {
        min(max(1, currentPage), totalPages)
    }

    var paginatedCards: [Card] {
        let start = (safePage - 1) * AppConstants.deckDetailPageSize
        let end = min(start + AppConstants.deckDetailPageSize, sortedCards.count)
        guard start < end else { return [] }
        return Array(sortedCards[start..<end])
    }

    func rating(for cardUuid: String) -> RatingAggregate? {
        ratings[cardUuid]
    }

    func load() async {
        isLoading = true
        errorMessage = nil

        do {
            async let deckTask = FetchAllPages.fetchDeckWithAllCards { pagination in
                try await self.api.decks.get(deckUuid: self.deckUuid, pagination: pagination)
            }
            async let ratingsTask = FetchAllPages.fetch { pagination in
                try await self.api.cards.listRatings(deckUuid: self.deckUuid, pagination: pagination)
            }

            let (loadedDeck, cards) = try await deckTask
            let ratingRows = try await ratingsTask

            deck = loadedDeck
            allCards = cards
            ratings = Dictionary(uniqueKeysWithValues: ratingRows.map { ($0.cardUuid, $0) })
        } catch {
            deck = nil
            allCards = []
            ratings = [:]
            errorMessage = LoadErrorMessage.userFacing(error)
        }

        isLoading = false
    }

    func reload() async {
        await load()
    }

    func markDeleted() {
        deck = nil
        allCards = []
        ratings = [:]
        isLoading = false
        errorMessage = nil
    }

    func setSort(_ option: CardSortOption) {
        sort = option
        currentPage = 1
    }

    func goToPage(_ page: Int) {
        currentPage = min(max(1, page), totalPages)
    }
}
