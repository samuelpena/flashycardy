import SwiftUI

struct EditDeckSheet: View {
    let deck: DeckReference
    let onUpdated: () async -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var name: String
    @State private var description: String
    @State private var isSubmitting = false
    @State private var errorMessage: String?

    @InjectAPI private var api

    init(deck: DeckReference, onUpdated: @escaping () async -> Void) {
        self.deck = deck
        self.onUpdated = onUpdated
        _name = State(initialValue: deck.name)
        _description = State(initialValue: deck.description ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField(L10n.EditDeck.namePlaceholder, text: $name)
                    TextField(L10n.EditDeck.descriptionPlaceholder, text: $description, axis: .vertical)
                        .lineLimit(3...6)
                } footer: {
                    Text(L10n.EditDeck.description)
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundStyle(.red)
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle(L10n.EditDeck.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(L10n.Common.cancel) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(isSubmitting ? L10n.Common.saving : L10n.Common.save) {
                        Task { await submit() }
                    }
                    .disabled(isSubmitting || name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }

    private func submit() async {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedName.isEmpty else { return }

        isSubmitting = true
        errorMessage = nil

        do {
            let trimmedDescription = description.trimmingCharacters(in: .whitespacesAndNewlines)
            _ = try await api.decks.patch(
                deckUuid: deck.uuid,
                input: PatchDeckInput(
                    name: trimmedName,
                    description: trimmedDescription.isEmpty ? nil : trimmedDescription
                )
            )
            dismiss()
            await onUpdated()
        } catch {
            errorMessage = ApiErrorMessage.message(for: error)
        }

        isSubmitting = false
    }
}
