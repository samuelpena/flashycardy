import SwiftUI

struct AddCardSheet: View {
    let deckUuid: String
    let onAdded: () async -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var front = ""
    @State private var back = ""
    @State private var isSubmitting = false
    @State private var errorMessage: String?

    @InjectAPI private var api

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField(L10n.AddCard.frontPlaceholder, text: $front, axis: .vertical)
                        .lineLimit(2...5)
                    TextField(L10n.AddCard.backPlaceholder, text: $back, axis: .vertical)
                        .lineLimit(2...5)
                } footer: {
                    Text(L10n.AddCard.description)
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundStyle(.red)
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle(L10n.AddCard.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(L10n.Common.cancel) { dismiss() }
                        .disabled(isSubmitting)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(isSubmitting ? L10n.AddCard.creating : L10n.AddCard.createCard) {
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
            _ = try await api.cards.create(
                deckUuid: deckUuid,
                input: CreateCardInput(front: trimmedFront, back: trimmedBack)
            )
            dismiss()
            await onAdded()
        } catch {
            errorMessage = ApiErrorMessage.message(for: error)
        }

        isSubmitting = false
    }
}
