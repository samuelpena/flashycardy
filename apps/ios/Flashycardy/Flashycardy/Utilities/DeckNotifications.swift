import Foundation

extension Notification.Name {
    /// Posted after a deck is deleted successfully. `object` is the deck UUID (`String`).
    static let deckDidDelete = Notification.Name("Flashycardy.deckDidDelete")
}
