import SwiftUI

struct GenerateCardsButton: View {
    let deckUuid: String
    let hasDescription: Bool
    let onGenerated: () async -> Void

    @InjectAPI private var api
    @State private var isGenerating = false
    @State private var errorMessage: String?
    @State private var showPricing = false

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if !hasDescription {
                Button {
                } label: {
                    Label(L10n.DeckDetail.generateWithAI, systemImage: "sparkles")
                }
                .buttonStyle(.bordered)
                .disabled(true)
            } else {
                Button {
                    Task { await generate() }
                } label: {
                    Label(
                        isGenerating ? L10n.GenerateCards.generating : L10n.DeckDetail.generateWithAI,
                        systemImage: isGenerating ? "hourglass" : "sparkles"
                    )
                }
                .buttonStyle(.bordered)
                .disabled(isGenerating)
            }

            if !hasDescription {
                Text(L10n.GenerateCards.tooltipNeedDescription)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: 220, alignment: .leading)
            }

            if let errorMessage {
                Text(errorMessage)
                    .font(.caption2)
                    .foregroundStyle(.red)
            }
        }
        .sheet(isPresented: $showPricing) {
            SafariView(url: .flashycardyPricing)
        }
    }

    private func generate() async {
        isGenerating = true
        errorMessage = nil

        do {
            _ = try await api.decks.generateCards(deckUuid: deckUuid)
            await onGenerated()
        } catch {
            if UpgradePrompt.shouldOpenPricing(for: error) {
                showPricing = true
            }
            errorMessage = ApiErrorMessage.message(for: error)
        }

        isGenerating = false
    }
}
