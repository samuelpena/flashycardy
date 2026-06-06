import SwiftUI

/// Lays out subviews left-to-right, wrapping to new rows (matches CSS `flex-wrap`).
struct FlowLayout: Layout {
    var horizontalSpacing: CGFloat = 8
    var verticalSpacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)

        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: ProposedViewSize(result.sizes[index])
            )
        }
    }

    private struct ArrangementResult {
        var positions: [CGPoint] = []
        var sizes: [CGSize] = []
        var size: CGSize = .zero
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> ArrangementResult {
        let maxWidth = proposal.width ?? .infinity
        var result = ArrangementResult()
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var usedWidth: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)

            if x > 0, x + size.width > maxWidth {
                x = 0
                y += rowHeight + verticalSpacing
                rowHeight = 0
            }

            result.positions.append(CGPoint(x: x, y: y))
            result.sizes.append(size)

            rowHeight = max(rowHeight, size.height)
            x += size.width + horizontalSpacing
            usedWidth = max(usedWidth, x - horizontalSpacing)
        }

        result.size = CGSize(
            width: proposal.width ?? usedWidth,
            height: y + rowHeight
        )
        return result
    }
}
