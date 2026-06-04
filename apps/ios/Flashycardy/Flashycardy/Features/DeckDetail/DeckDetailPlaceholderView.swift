import SwiftUI

/// Placeholder until PR-4 implements full deck detail.
struct DeckDetailPlaceholderView: View {
    let deckUuid: String

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "rectangle.on.rectangle.angled")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text(L10n.DeckDetail.placeholderTitle)
                .font(.title2.bold())

            Text(L10n.DeckDetail.placeholderBody)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            Text(deckUuid)
                .font(.caption2.monospaced())
                .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .navigationTitle(L10n.DeckDetail.placeholderTitle)
        .navigationBarTitleDisplayMode(.inline)
    }
}
