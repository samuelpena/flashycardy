import SwiftUI

struct DeckCardView: View {
    let deck: DeckListItem
    let sessionCount: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(L10n.Dashboard.nameHeader)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
                Text(deck.name)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(2)
                    .foregroundStyle(.primary)
            }

            Divider()

            VStack(alignment: .leading, spacing: 4) {
                Text(L10n.Dashboard.descriptionHeader)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
                Text(deck.description ?? "")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
                    .frame(minHeight: 48, alignment: .topLeading)
            }

            HStack {
                Label(formattedUpdatedDate, systemImage: "clock")
                    .font(.caption)
                    .foregroundStyle(.tertiary)

                if sessionCount > 0 {
                    Label("\(sessionCount)", systemImage: "book")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(16)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private var formattedUpdatedDate: String {
        guard let date = ISO8601DateParser.parse(deck.updatedAt) else {
            return deck.updatedAt
        }
        return date.formatted(date: .abbreviated, time: .omitted)
    }
}
