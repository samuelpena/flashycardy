import SwiftUI

private enum AnalyticsRoute: Hashable {
    case deckDetail(String)
}

struct AnalyticsView: View {
    @InjectAPI private var api
    @State private var viewModel: AnalyticsViewModel?

    var body: some View {
        Group {
            if let viewModel {
                analyticsContent(viewModel: viewModel)
            } else {
                ProgressView(L10n.Extension.loading)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .navigationTitle(L10n.Analytics.title)
        .navigationBarTitleDisplayMode(.large)
        .task {
            if viewModel == nil {
                let model = AnalyticsViewModel(api: api)
                viewModel = model
                await model.load()
            }
        }
        .navigationDestination(for: AnalyticsRoute.self) { route in
            switch route {
            case .deckDetail(let uuid):
                DeckDetailView(deckUuid: uuid)
            }
        }
    }

    @ViewBuilder
    private func analyticsContent(viewModel: AnalyticsViewModel) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text(L10n.Analytics.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                if viewModel.isLoading {
                    ProgressView(L10n.Extension.loading)
                        .frame(maxWidth: .infinity, minHeight: 200)
                } else if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.subheadline)
                } else if viewModel.sessions.isEmpty {
                    emptyState
                } else {
                    sessionList(viewModel: viewModel)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .refreshable {
            await viewModel.reload()
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "chart.bar")
                .font(.system(size: 44))
                .foregroundStyle(.secondary)
            Text(L10n.Analytics.emptyTitle)
                .font(.title3.bold())
            Text(L10n.Analytics.emptyDescription)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }

    private func sessionList(viewModel: AnalyticsViewModel) -> some View {
        LazyVStack(spacing: 0) {
            headerRow

            ForEach(viewModel.sessions) { session in
                if let deck = session.deck {
                    NavigationLink(value: AnalyticsRoute.deckDetail(deck.uuid)) {
                        AnalyticsSessionRow(session: session)
                    }
                    .buttonStyle(.plain)
                } else {
                    AnalyticsSessionRow(session: session)
                }

                if session.id != viewModel.sessions.last?.id {
                    Divider()
                }
            }
        }
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private var headerRow: some View {
        HStack(spacing: 8) {
            Text(L10n.Analytics.colDeck)
                .frame(maxWidth: .infinity, alignment: .leading)
            Text(L10n.Analytics.colTotalCards)
                .frame(width: 36, alignment: .center)
            Text(L10n.Analytics.colCorrect)
                .frame(width: 36, alignment: .center)
            Text(L10n.Analytics.colScore)
                .frame(width: 44, alignment: .center)
        }
        .font(.caption2.weight(.semibold))
        .foregroundStyle(.secondary)
        .textCase(.uppercase)
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
    }
}

struct AnalyticsSessionRow: View {
    let session: StudySession

    var body: some View {
        let score = AnalyticsViewModel.scorePercent(for: session)

        HStack(spacing: 8) {
            VStack(alignment: .leading, spacing: 2) {
                Text(session.deck?.name ?? "—")
                    .font(.subheadline.weight(.medium))
                    .lineLimit(1)
                HStack(spacing: 6) {
                    Text("#\(session.id)")
                        .font(.caption2.monospaced())
                        .foregroundStyle(.tertiary)
                    if let date = formattedDate {
                        Text(date)
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Text("\(session.totalCards)")
                .font(.caption)
                .frame(width: 36, alignment: .center)

            Text("\(session.correctCount)")
                .font(.caption.weight(.medium))
                .foregroundStyle(.green)
                .frame(width: 36, alignment: .center)

            ScoreBadge(percent: score)
                .frame(width: 44, alignment: .center)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }

    private var formattedDate: String? {
        guard let date = ISO8601DateParser.parse(session.completedAt) else { return nil }
        return date.formatted(date: .abbreviated, time: .shortened)
    }
}

struct ScoreBadge: View {
    let percent: Int

    var body: some View {
        Text("\(percent)%")
            .font(.caption2.weight(.semibold))
            .padding(.horizontal, 6)
            .padding(.vertical, 3)
            .background(backgroundColor)
            .foregroundStyle(foregroundColor)
            .clipShape(Capsule())
    }

    private var backgroundColor: Color {
        if percent >= 80 { return .green.opacity(0.2) }
        if percent >= 50 { return Color(.tertiarySystemFill) }
        return .red.opacity(0.2)
    }

    private var foregroundColor: Color {
        if percent >= 80 { return .green }
        if percent >= 50 { return .primary }
        return .red
    }
}
