import Foundation

/// Factory for the full FlashyCardy REST client (decks, cards, study sessions).
struct FlashycardyAPI {
    let client: APIClient
    let decks: DecksService
    let cards: CardsService
    let studySessions: StudySessionsService

    init(configuration: APIClientConfiguration) {
        let client = APIClient(configuration: configuration)
        self.client = client
        self.decks = DecksService(client: client)
        self.cards = CardsService(client: client)
        self.studySessions = StudySessionsService(client: client)
    }
}
