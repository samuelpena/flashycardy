import SwiftUI

struct EditCardSheet: View {
    let deckUuid: String
    let card: Card
    let onUpdated: () async -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var front: String
    @State private var back: String
    @State private var isSubmitting = false
    @State private var errorMessage: String?

    @InjectAPI private var api

    init(deckUuid: String, card: Card, onUpdated: @escaping () async -> Void) {
        self.deckUuid = deckUuid
        self.card = card
        self.onUpdated = onUpdated
        _front = State(initialValue: card.front)
        _back = State(initialValue: card.back)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField(L10n.EditCard.frontPlaceholder, text: $front, axis: .vertical)
                        .lineLimit(2...5)
                    TextField(L10n.EditCard.backPlaceholder, text: $back, axis: .vertical)
                        .lineLimit(2...5)
                } footer: {
                    Text(L10n.EditCard.description)
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundStyle(.red)
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle(L10n.EditCard.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(L10n.Common.cancel) { dismiss() }
                        .disabled(isSubmitting)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(isSubmitting ? L10n.Common.saving : L10n.Common.save) {
                        Task { await submit() }
                    }
                    .disabled(isSubmitting || !canSubmit)
                }
            }
        }
    }

    private var canSubmit: Bool {
        !front.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            && !back.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func submit() async {
        let trimmedFront = front.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedBack = back.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedFront.isEmpty, !trimmedBack.isEmpty else { return }

        isSubmitting = true
        errorMessage = nil

        do {
            _ = try await api.cards.patch(
                deckUuid: deckUuid,
                cardUuid: card.uuid,
                input: PatchCardInput(front: trimmedFront, back: trimmedBack)
            )
            dismiss()
            await onUpdated()
        } catch {
            errorMessage = ApiErrorMessage.message(for: error)
        }

        isSubmitting = false
    }
}
