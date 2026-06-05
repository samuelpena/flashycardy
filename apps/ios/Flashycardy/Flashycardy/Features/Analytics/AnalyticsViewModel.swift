import Foundation
import Observation

@MainActor
@Observable
final class AnalyticsViewModel {
    private(set) var sessions: [StudySession] = []
    private(set) var isLoading = true
    private(set) var errorMessage: String?

    private let api: FlashycardyAPI

    init(api: FlashycardyAPI) {
        self.api = api
    }

    func load() async {
        isLoading = true
        errorMessage = nil

        do {
            sessions = try await FetchAllPages.fetch { pagination in
                try await self.api.studySessions.list(pagination: pagination)
            }
        } catch {
            sessions = []
            errorMessage = LoadErrorMessage.userFacing(error)
        }

        isLoading = false
    }

    func reload() async {
        await load()
    }

    static func scorePercent(for session: StudySession) -> Int {
        guard session.totalCards > 0 else { return 0 }
        return Int((Double(session.correctCount) / Double(session.totalCards) * 100).rounded())
    }
}
