import SwiftUI

private enum DeckDetailRoute: Hashable {
    case study
}

struct DeckDetailView: View {
    let deckUuid: String

    @Environment(\.dismiss) private var dismiss
    @InjectAPI private var api

    @State private var viewModel: DeckDetailViewModel?
    @State private var showAddCard = false
    @State private var cardToEdit: Card?
    @State private var cardToDelete: Card?
    @State private var showEditDeck = false
    @State private var showDeleteDeck = false

    var body: some View {
        Group {
            if let viewModel {
                detailContent(viewModel: viewModel)
            } else {
                ProgressView(L10n.Extension.loading)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .task {
            if viewModel == nil {
                let model = DeckDetailViewModel(deckUuid: deckUuid, api: api)
                viewModel = model
                await model.load()
            }
        }
        .sheet(isPresented: $showAddCard) {
            if let viewModel {
                AddCardSheet(deckUuid: deckUuid) {
                    await viewModel.reload()
                }
            }
        }
        .sheet(item: $cardToEdit) { card in
            if let viewModel {
                EditCardSheet(deckUuid: deckUuid, card: card) {
                    await viewModel.reload()
                }
            }
        }
        .sheet(item: $cardToDelete) { card in
            if let viewModel {
                DeleteCardSheet(deckUuid: deckUuid, card: card) {
                    await viewModel.reload()
                }
            }
        }
        .sheet(isPresented: $showEditDeck) {
            if let viewModel, let deckRef = viewModel.deckReference {
                EditDeckSheet(deck: deckRef) {
                    await viewModel.reload()
                }
            }
        }
        .sheet(isPresented: $showDeleteDeck) {
            if let viewModel, let deckRef = viewModel.deckReference {
                DeleteDeckSheet(deck: deckRef) {
                    viewModel.markDeleted()
                    dismiss()
                }
            }
        }
    }

    @ViewBuilder
    private func detailContent(viewModel: DeckDetailViewModel) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if viewModel.isLoading {
                    ProgressView(L10n.Extension.loading)
                        .frame(maxWidth: .infinity, minHeight: 200)
                } else if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.subheadline)
                } else if let deck = viewModel.deck {
                    header(deck: deck, viewModel: viewModel)

                    if viewModel.allCards.isEmpty {
                        emptyCardsState
                    } else {
                        cardGrid(viewModel: viewModel)
                        paginationControls(viewModel: viewModel)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .refreshable {
            await viewModel.reload()
        }
        .navigationTitle(deckTitle(viewModel: viewModel))
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(for: DeckDetailRoute.self) { route in
            switch route {
            case .study:
                if let deck = viewModel.deck {
                    StudyView(
                        deckUuid: deckUuid,
                        deckName: deck.name,
                        cards: viewModel.allCards
                    )
                }
            }
        }
    }

    private func deckTitle(viewModel: DeckDetailViewModel) -> String {
        viewModel.deck?.name ?? L10n.DeckDetail.backToDecks
    }

    private func header(deck: DeckWithCards, viewModel: DeckDetailViewModel) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text(deck.name)
                    .font(.title2.bold())
                Text(L10n.Common.cardCount(viewModel.allCards.count))
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color(.tertiarySystemFill))
                    .clipShape(Capsule())
            }

            if let description = deck.description, !description.isEmpty {
                Text(description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            FlowLayout(horizontalSpacing: 8, verticalSpacing: 8) {
                NavigationLink(value: DeckDetailRoute.study) {
                    Label(L10n.DeckDetail.study, systemImage: "book")
                }
                .buttonStyle(.borderedProminent)

                GenerateCardsButton(
                    deckUuid: deckUuid,
                    hasDescription: !(deck.description ?? "").isEmpty
                ) {
                    await viewModel.reload()
                }

                Button {
                    showAddCard = true
                } label: {
                    Label(L10n.DeckDetail.addCard, systemImage: "plus")
                }
                .buttonStyle(.bordered)

                Button {
                    showEditDeck = true
                } label: {
                    Label(L10n.Common.edit, systemImage: "pencil")
                }
                .buttonStyle(.bordered)

                Button(role: .destructive) {
                    showDeleteDeck = true
                } label: {
                    Label(L10n.Common.delete, systemImage: "trash")
                }
                .buttonStyle(.bordered)

                if !viewModel.allCards.isEmpty {
                    Menu {
                        Picker("Sort", selection: Binding(
                            get: { viewModel.sort },
                            set: { viewModel.setSort($0) }
                        )) {
                            ForEach(CardSortOption.allCases) { option in
                                Text(option.label).tag(option)
                            }
                        }
                    } label: {
                        Label(viewModel.sort.label, systemImage: "arrow.up.arrow.down")
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private var emptyCardsState: some View {
        VStack(spacing: 16) {
            Image(systemName: "rectangle.stack")
                .font(.system(size: 44))
                .foregroundStyle(.secondary)
            Text(L10n.DeckDetail.emptyCardsTitle)
                .font(.title3.bold())
            Text(L10n.DeckDetail.emptyCardsDescription)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button(L10n.DeckDetail.addFirstCard) {
                showAddCard = true
            }
            .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }

    private func cardGrid(viewModel: DeckDetailViewModel) -> some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            ForEach(viewModel.paginatedCards, id: \.uuid) { card in
                CardTileView(
                    card: card,
                    rating: viewModel.rating(for: card.uuid),
                    onEdit: { cardToEdit = card },
                    onDelete: { cardToDelete = card }
                )
            }
        }
    }

    @ViewBuilder
    private func paginationControls(viewModel: DeckDetailViewModel) -> some View {
        if viewModel.sortedCards.count > AppConstants.deckDetailPageSize {
            HStack {
                Button {
                    viewModel.goToPage(viewModel.safePage - 1)
                } label: {
                    Image(systemName: "chevron.left")
                }
                .disabled(viewModel.safePage <= 1)

                Spacer()

                Text(L10n.Dashboard.pageOf(viewModel.safePage, viewModel.totalPages))
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                Spacer()

                Button {
                    viewModel.goToPage(viewModel.safePage + 1)
                } label: {
                    Image(systemName: "chevron.right")
                }
                .disabled(viewModel.safePage >= viewModel.totalPages)
            }
            .padding(.top, 8)
        }
    }
}
