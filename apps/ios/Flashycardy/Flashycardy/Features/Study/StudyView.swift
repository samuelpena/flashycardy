import SwiftUI

struct StudyView: View {
    let deckUuid: String
    let deckName: String
    let cards: [Card]

    @InjectAPI private var api
    @State private var viewModel: StudyViewModel?

    var body: some View {
        Group {
            if cards.isEmpty {
                emptyState
            } else if let viewModel {
                studyContent(viewModel: viewModel)
            } else {
                ProgressView(L10n.Extension.loading)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .navigationTitle(L10n.StudyPage.title(deckName))
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if viewModel == nil {
                viewModel = StudyViewModel(deckUuid: deckUuid, cards: cards, api: api)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "rectangle.stack")
                .font(.system(size: 44))
                .foregroundStyle(.secondary)
            Text(L10n.StudyClient.emptyTitle)
                .font(.title3.bold())
            Text(L10n.StudyClient.emptyDescription)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(32)
    }

    @ViewBuilder
    private func studyContent(viewModel: StudyViewModel) -> some View {
        if viewModel.completed {
            completionView(viewModel: viewModel)
        } else {
            activeStudyView(viewModel: viewModel)
        }
    }

    private func activeStudyView(viewModel: StudyViewModel) -> some View {
        VStack(spacing: 20) {
            HStack {
                Text("\(viewModel.index + 1) / \(viewModel.total)")
                    .font(.caption.weight(.medium))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Color(.tertiarySystemFill))
                    .clipShape(Capsule())

                Spacer()

                Button {
                    viewModel.shuffleAndRestart()
                } label: {
                    Label(L10n.StudyClient.shuffle, systemImage: "shuffle")
                        .font(.subheadline)
                }

                Button {
                    viewModel.restart()
                } label: {
                    Label(L10n.StudyClient.restart, systemImage: "arrow.counterclockwise")
                        .font(.subheadline)
                }
            }

            ProgressView(value: viewModel.progress)
                .tint(.accentColor)

            if let card = viewModel.currentCard {
                FlashcardView(front: card.front, back: card.back, flipped: viewModel.flipped)
                    .onTapGesture {
                        viewModel.flip()
                    }
            }

            if viewModel.flipped {
                ratingControls(viewModel: viewModel)
            } else {
                navigationControls(viewModel: viewModel)
            }

            Text(L10n.StudyClient.keyboardHints)
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private func navigationControls(viewModel: StudyViewModel) -> some View {
        HStack(spacing: 12) {
            Button {
                viewModel.goPrev()
            } label: {
                Label(L10n.StudyClient.previous, systemImage: "chevron.left")
            }
            .disabled(viewModel.index == 0)

            Spacer()

            Button {
                viewModel.flip()
            } label: {
                Label(
                    viewModel.index == viewModel.total - 1
                        ? L10n.StudyClient.revealFinish
                        : L10n.StudyClient.next,
                    systemImage: "chevron.right"
                )
            }
            .buttonStyle(.borderedProminent)
        }
    }

    private func ratingControls(viewModel: StudyViewModel) -> some View {
        HStack(spacing: 12) {
            Button {
                viewModel.goPrev()
            } label: {
                Label(L10n.StudyClient.previous, systemImage: "chevron.left")
            }
            .disabled(viewModel.index == 0)

            Button {
                viewModel.markIncorrect()
            } label: {
                Label(L10n.StudyClient.nope, systemImage: "hand.thumbsdown.fill")
            }
            .buttonStyle(.bordered)
            .tint(.red)

            Button {
                viewModel.markCorrect()
            } label: {
                Label(L10n.StudyClient.gotIt, systemImage: "hand.thumbsup.fill")
            }
            .buttonStyle(.borderedProminent)
            .tint(.green)
        }
    }

    private func completionView(viewModel: StudyViewModel) -> some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    Text(L10n.StudyClient.sessionComplete)
                        .font(.title2.bold())
                    Text(L10n.StudyClient.studiedAll(count: viewModel.total))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                if viewModel.ratedCount > 0 {
                    HStack(spacing: 12) {
                        statTile(
                            count: viewModel.correctCount,
                            label: L10n.StudyClient.correct,
                            icon: "hand.thumbsup.fill",
                            color: .green
                        )
                        statTile(
                            count: viewModel.incorrectCount,
                            label: L10n.StudyClient.incorrect,
                            icon: "hand.thumbsdown.fill",
                            color: .red
                        )
                    }

                    if let pct = viewModel.scorePercent {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(L10n.StudyClient.score)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Spacer()
                                Text("\(pct)%")
                                    .font(.caption.weight(.semibold))
                            }
                            ProgressView(value: Double(pct) / 100)
                                .tint(.green)
                        }
                    }

                    if viewModel.skippedCount > 0 {
                        Text(L10n.StudyClient.skipped(count: viewModel.skippedCount))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                if viewModel.saving {
                    HStack(spacing: 8) {
                        ProgressView()
                            .controlSize(.small)
                        Text(L10n.StudyClient.savingResults)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                if let error = viewModel.saveError {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                }

                HStack(spacing: 12) {
                    Button {
                        viewModel.shuffleAndRestart()
                    } label: {
                        Label(L10n.StudyClient.shuffleRestart, systemImage: "shuffle")
                    }
                    .buttonStyle(.bordered)

                    Button {
                        viewModel.restart()
                    } label: {
                        Label(L10n.StudyClient.restart, systemImage: "arrow.counterclockwise")
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
            .padding(24)
        }
    }

    private func statTile(count: Int, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
            Text("\(count)")
                .font(.title.bold())
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}
