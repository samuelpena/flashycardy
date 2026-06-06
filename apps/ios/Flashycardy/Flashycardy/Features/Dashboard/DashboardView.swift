import ClerkKit
import ClerkKitUI
import SwiftUI

enum DashboardRoute: Hashable {
    case deckDetail(String)
}

struct DashboardView: View {
    @Environment(Clerk.self) private var clerk
    @InjectAPI private var api
    @State private var path = NavigationPath()
    @State private var viewModel: DashboardViewModel?
    @State private var showCreateDeck = false
    @State private var deckToEdit: DeckListItem?
    @State private var deckToDelete: DeckListItem?
    @State private var authSheetPresented = false

    var body: some View {
        NavigationStack(path: $path) {
            Group {
                if let viewModel {
                    dashboardContent(viewModel: viewModel)
                } else {
                    ProgressView(L10n.Extension.loading)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text(L10n.Common.appName)
                        .font(.headline)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    ProfileToolbarButton(authSheetPresented: $authSheetPresented)
                }
            }
            .navigationDestination(for: DashboardRoute.self) { route in
                switch route {
                case .deckDetail(let uuid):
                    DeckDetailView(deckUuid: uuid)
                }
            }
        }
        .sheet(isPresented: $authSheetPresented) {
            AuthView()
        }
        .task(id: clerk.session?.id) {
            guard clerk.session != nil else {
                viewModel = nil
                return
            }
            let entitlements = await ClerkBillingEntitlements.current(clerk: clerk)
            let model = DashboardViewModel(
                api: api,
                hasUnlimitedDecks: entitlements.hasUnlimitedDecks
            )
            viewModel = model
            await model.load()
        }
        .sheet(isPresented: $showCreateDeck) {
            if let viewModel {
                CreateDeckSheet(
                    deckCount: viewModel.decks.count,
                    hasUnlimitedDecks: viewModel.hasUnlimitedDecks
                ) { deckUuid in
                    await viewModel.reload()
                    if let deckUuid {
                        path.append(DashboardRoute.deckDetail(deckUuid))
                    }
                }
            }
        }
        .sheet(item: $deckToEdit) { deck in
            if let viewModel {
                EditDeckSheet(deck: DeckReference(deck)) {
                    await viewModel.reload()
                }
            }
        }
        .sheet(item: $deckToDelete) { deck in
            if let viewModel {
                DeleteDeckSheet(deck: DeckReference(deck)) {
                    await viewModel.reload()
                }
            }
        }
    }

    @ViewBuilder
    private func dashboardContent(viewModel: DashboardViewModel) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header(viewModel: viewModel)

                if viewModel.isLoading {
                    ProgressView(L10n.Extension.loading)
                        .frame(maxWidth: .infinity, minHeight: 200)
                } else if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.subheadline)
                } else if viewModel.decks.isEmpty {
                    emptyState
                } else {
                    deckGrid(viewModel: viewModel)
                    paginationControls(viewModel: viewModel)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .refreshable {
            await viewModel.reload()
        }
    }

    private func header(viewModel: DashboardViewModel) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(L10n.Dashboard.title)
                    .font(.largeTitle.bold())
                HStack(spacing: 8) {
                    Text(L10n.Dashboard.subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    if viewModel.showDeckLimitBanner {
                        Text(L10n.Common.deckLimitBanner(
                            used: viewModel.decks.count,
                            limit: AppConstants.freeDeckLimit
                        ))
                        .font(.caption)
                        .foregroundStyle(.orange)
                    }
                }
            }

            HStack(spacing: 8) {
                if !viewModel.decks.isEmpty {
                    Menu {
                        Picker("Sort", selection: Binding(
                            get: { viewModel.sort },
                            set: { viewModel.setSort($0) }
                        )) {
                            ForEach(DeckSortOption.allCases) { option in
                                Text(option.label).tag(option)
                            }
                        }
                    } label: {
                        Label(viewModel.sort.label, systemImage: "arrow.up.arrow.down")
                            .font(.subheadline)
                    }
                }

                Spacer()

                Button {
                    showCreateDeck = true
                } label: {
                    Label(L10n.CreateDeck.triggerDefault, systemImage: "plus")
                }
                .buttonStyle(.borderedProminent)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "rectangle.stack")
                .font(.system(size: 44))
                .foregroundStyle(.secondary)
            Text(L10n.Dashboard.emptyTitle)
                .font(.title3.bold())
            Text(L10n.Dashboard.emptyDescription)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button(L10n.CreateDeck.createFirstDeck) {
                showCreateDeck = true
            }
            .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }

    private func deckGrid(viewModel: DashboardViewModel) -> some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            ForEach(viewModel.paginatedDecks, id: \.uuid) { deck in
                NavigationLink(value: DashboardRoute.deckDetail(deck.uuid)) {
                    DeckCardView(
                        deck: deck,
                        sessionCount: viewModel.sessionCount(for: deck.uuid)
                    )
                }
                .buttonStyle(.plain)
                .contextMenu {
                    Button(L10n.Common.edit) {
                        deckToEdit = deck
                    }
                    Button(L10n.Common.delete, role: .destructive) {
                        deckToDelete = deck
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func paginationControls(viewModel: DashboardViewModel) -> some View {
        if viewModel.sortedDecks.count > AppConstants.dashboardPageSize {
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
