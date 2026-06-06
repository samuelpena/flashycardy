import Foundation

enum SortByUpdatedAt {
    /// Returns `true` when `lhs` should appear before `rhs` (newest first).
    static func isDescending(lhs: String, rhs: String) -> Bool {
        let left = ISO8601DateParser.parse(lhs) ?? .distantPast
        let right = ISO8601DateParser.parse(rhs) ?? .distantPast
        if left != right {
            return left > right
        }
        return lhs > rhs
    }
}
