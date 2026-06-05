import SwiftUI

struct DeleteCardSheet: View {
    let deckUuid: String
    let card: Card
    let onDeleted: () async -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var isDeleting = false
    @State private var errorMessage: String?

    @InjectAPI private var api

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                Text(L10n.DeleteCard.description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                if let errorMessage {
                    Text(errorMessage)
                        .font(.footnote)
                        .foregroundStyle(.red)
                }

                Spacer()

                Button(role: .destructive) {
                    Task { await deleteCard() }
                } label: {
                    Text(isDeleting ? L10n.DeleteCard.deleting : L10n.DeleteCard.deleteCard)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(isDeleting)
            }
            .padding(20)
            .navigationTitle(L10n.DeleteCard.title)
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

    private func deleteCard() async {
        isDeleting = true
        errorMessage = nil

        do {
            _ = try await api.cards.delete(deckUuid: deckUuid, cardUuid: card.uuid)
            dismiss()
            await onDeleted()
        } catch {
            errorMessage = ApiErrorMessage.message(for: error)
        }

        isDeleting = false
    }
}
