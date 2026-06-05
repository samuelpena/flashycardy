import SwiftUI

struct FlashcardView: View {
    let front: String
    let back: String
    let flipped: Bool

    var body: some View {
        ZStack {
            cardFace(label: L10n.Common.front, text: front, hint: L10n.StudyClient.flipHint)
                .opacity(flipped ? 0 : 1)
                .rotation3DEffect(.degrees(flipped ? 180 : 0), axis: (x: 0, y: 1, z: 0))

            cardFace(label: L10n.Common.back, text: back, hint: L10n.StudyClient.didYouGetIt)
                .opacity(flipped ? 1 : 0)
                .rotation3DEffect(.degrees(flipped ? 0 : -180), axis: (x: 0, y: 1, z: 0))
        }
        .frame(minHeight: 280)
        .animation(.easeInOut(duration: 0.45), value: flipped)
    }

    private func cardFace(label: String, text: String, hint: String) -> some View {
        VStack(spacing: 16) {
            Text(label)
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
                .tracking(1.2)

            Text(text)
                .font(.title2.weight(.semibold))
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)

            Text(hint)
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(Color(.separator), lineWidth: 0.5)
        )
    }
}
