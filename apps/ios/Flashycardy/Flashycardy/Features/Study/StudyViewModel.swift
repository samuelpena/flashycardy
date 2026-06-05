import Foundation
import Observation

enum StudyRating: Equatable {
    case correct
    case incorrect
}

@MainActor
@Observable
final class StudyViewModel {
    private(set) var deckOrder: [Card]
    private(set) var index = 0
    private(set) var flipped = false
    private(set) var completed = false
    private(set) var results: [String: StudyRating] = [:]
    private(set) var saving = false
    private(set) var saveError: String?

    let deckUuid: String
    private let sourceCards: [Card]
    private let api: FlashycardyAPI
    private var didSave = false

    init(deckUuid: String, cards: [Card], api: FlashycardyAPI) {
        self.deckUuid = deckUuid
        self.sourceCards = cards
        self.deckOrder = cards
        self.api = api
    }

    var total: Int { deckOrder.count }

    var currentCard: Card? {
        guard index >= 0, index < deckOrder.count else { return nil }
        return deckOrder[index]
    }

    var progress: Double {
        guard total > 0 else { return 0 }
        return Double(index + 1) / Double(total)
    }

    var correctCount: Int {
        results.values.filter { $0 == .correct }.count
    }

    var incorrectCount: Int {
        results.values.filter { $0 == .incorrect }.count
    }

    var ratedCount: Int { correctCount + incorrectCount }

    var scorePercent: Int? {
        guard ratedCount > 0 else { return nil }
        return Int((Double(correctCount) / Double(ratedCount) * 100).rounded())
    }

    var skippedCount: Int { total - ratedCount }

    func flip() {
        flipped.toggle()
    }

    func goNext() {
        if index >= total - 1 {
            completed = true
            Task { await saveIfNeeded() }
        } else {
            index += 1
            flipped = false
        }
    }

    func goPrev() {
        guard index > 0 else { return }
        index -= 1
        flipped = false
    }

    func markCorrect() {
        markResult(.correct)
    }

    func markIncorrect() {
        markResult(.incorrect)
    }

    func restart() {
        didSave = false
        deckOrder = sourceCards
        index = 0
        flipped = false
        completed = false
        results = [:]
        saveError = nil
    }

    func shuffleAndRestart() {
        didSave = false
        deckOrder = sourceCards.shuffled()
        index = 0
        flipped = false
        completed = false
        results = [:]
        saveError = nil
    }

    private func markResult(_ rating: StudyRating) {
        guard let card = currentCard else { return }
        results[card.uuid] = rating
        goNext()
    }

    private func saveIfNeeded() async {
        guard completed, !didSave else { return }

        let cardResults = deckOrder.compactMap { card -> StudySessionCardResult? in
            guard let rating = results[card.uuid] else { return nil }
            return StudySessionCardResult(cardUuid: card.uuid, isCorrect: rating == .correct)
        }

        guard !cardResults.isEmpty else { return }

        didSave = true
        saving = true
        saveError = nil

        do {
            _ = try await api.studySessions.create(
                CreateStudySessionInput(deckUuid: deckUuid, cardResults: cardResults)
            )
        } catch {
            saveError = ApiErrorMessage.message(for: error)
        }

        saving = false
    }
}
