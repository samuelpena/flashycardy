import SwiftUI

struct CardTileView: View {
    let card: Card
    let rating: RatingAggregate?
    let onEdit: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(L10n.DeckDetail.fieldFront)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
                Text(card.front)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(2)
                    .frame(minHeight: 42, alignment: .topLeading)
            }

            Divider()

            VStack(alignment: .leading, spacing: 4) {
                Text(L10n.DeckDetail.fieldBack)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
                Text(card.back)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
                    .frame(minHeight: 60, alignment: .topLeading)
            }

            HStack {
                if let rating, rating.correctCount > 0 || rating.incorrectCount > 0 {
                    HStack(spacing: 12) {
                        Label("\(rating.correctCount)", systemImage: "hand.thumbsup.fill")
                            .font(.caption)
                            .foregroundStyle(.green)
                        Label("\(rating.incorrectCount)", systemImage: "hand.thumbsdown.fill")
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                }

                Spacer()

                Button(L10n.Common.edit, action: onEdit)
                    .font(.caption)
                Button(L10n.Common.delete, role: .destructive, action: onDelete)
                    .font(.caption)
            }
        }
        .padding(16)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}
