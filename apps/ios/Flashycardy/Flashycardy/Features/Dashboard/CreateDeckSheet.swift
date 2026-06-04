import SwiftUI

struct CreateDeckSheet: View {
    let deckCount: Int
    let onCreated: () async -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var description = ""
    @State private var isSubmitting = false
    @State private var errorMessage: String?
    @State private var showPricing = false

    @InjectAPI private var api

    private var limitReached: Bool {
        deckCount >= AppConstants.freeDeckLimit
    }

    var body: some View {
        NavigationStack {
            Group {
                if limitReached {
                    limitReachedContent
                } else {
                    formContent
                }
            }
            .navigationTitle(L10n.CreateDeck.dialogTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(L10n.Common.cancel) { dismiss() }
                }
                if !limitReached {
                    ToolbarItem(placement: .confirmationAction) {
                        Button(isSubmitting ? L10n.CreateDeck.creating : L10n.CreateDeck.createDeck) {
                            Task { await submit() }
                        }
                        .disabled(isSubmitting || name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
            }
            .sheet(isPresented: $showPricing) {
                SafariView(url: .flashycardyPricing)
            }
        }
    }

    private var formContent: some View {
        Form {
            Section {
                TextField(L10n.CreateDeck.namePlaceholder, text: $name)
                TextField(L10n.CreateDeck.descriptionPlaceholder, text: $description, axis: .vertical)
                    .lineLimit(3...6)
            } footer: {
                Text(L10n.CreateDeck.dialogDescription)
            }

            if let errorMessage {
                Section {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                        .font(.footnote)
                }
            }
        }
    }

    private var limitReachedContent: some View {
        VStack(spacing: 16) {
            Text(L10n.CreateDeck.limitTitle)
                .font(.title3.bold())
            Text(L10n.CreateDeck.limitDescription)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button(L10n.CreateDeck.viewPlans) {
                showPricing = true
            }
            .buttonStyle(.borderedProminent)
        }
        .padding(24)
    }

    private func submit() async {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedName.isEmpty else { return }

        isSubmitting = true
        errorMessage = nil

        do {
            let trimmedDescription = description.trimmingCharacters(in: .whitespacesAndNewlines)
            var input = CreateDeckInput(name: trimmedName)
            if !trimmedDescription.isEmpty {
                input.description = trimmedDescription
            }
            _ = try await api.decks.create(input)
            dismiss()
            await onCreated()
        } catch {
            if ApiErrorMessage.isDeckLimitError(error) {
                showPricing = true
            }
            errorMessage = ApiErrorMessage.message(for: error)
        }

        isSubmitting = false
    }
}
