import SwiftUI

struct DeleteDeckSheet: View {
    let deck: DeckListItem
    let onDeleted: () async -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var isDeleting = false
    @State private var errorMessage: String?

    @InjectAPI private var api

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                Text(L10n.DeleteDeck.descriptionEmpty)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                if let errorMessage {
                    Text(errorMessage)
                        .font(.footnote)
                        .foregroundStyle(.red)
                }

                Spacer()

                Button(role: .destructive) {
                    Task { await deleteDeck() }
                } label: {
                    Text(isDeleting ? L10n.DeleteDeck.deleting : L10n.DeleteDeck.deleteDeck)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(isDeleting)
            }
            .padding(20)
            .navigationTitle(L10n.DeleteDeck.title(deck.name))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(L10n.Common.cancel) { dismiss() }
                        .disabled(isDeleting)
                }
            }
        }
        .presentationDetents([.medium])
    }

    private func deleteDeck() async {
        isDeleting = true
        errorMessage = nil

        do {
            _ = try await api.decks.delete(deckUuid: deck.uuid)
            dismiss()
            await onDeleted()
        } catch {
            errorMessage = ApiErrorMessage.message(for: error)
        }

        isDeleting = false
    }
}
