import Foundation
import SwiftUI

/// UI strings backed by `Resources/Localizable.xcstrings` (en + es).
enum L10n {
    enum Common {
        static var appName: String { loc("Common.appName") }
        static var cancel: String { loc("Common.cancel") }
        static var save: String { loc("Common.save") }
        static var saving: String { loc("Common.saving") }
        static var edit: String { loc("Common.edit") }
        static var delete: String { loc("Common.delete") }
        static var front: String { loc("Common.front") }
        static var back: String { loc("Common.back") }
        static var tryAgain: String { loc("Common.tryAgain") }

        static func deckLimitBanner(used: Int, limit: Int) -> String {
            loc("Common.deckLimitBanner")
                .replacingOccurrences(of: "{used}", with: "\(used)")
                .replacingOccurrences(of: "{limit}", with: "\(limit)")
        }

        static func cardCount(_ count: Int) -> String {
            count == 1 ? "1 \(cardWord)" : "\(count) \(cardsWord)"
        }

        private static var cardWord: String {
            LocaleManager.currentAppLocale == .es ? "tarjeta" : "card"
        }

        private static var cardsWord: String {
            LocaleManager.currentAppLocale == .es ? "tarjetas" : "cards"
        }
    }

    enum Dashboard {
        static var title: String { loc("Dashboard.title") }
        static var subtitle: String { loc("Dashboard.subtitle") }
        static var analytics: String { loc("Dashboard.analytics") }
        static var emptyTitle: String { loc("Dashboard.emptyTitle") }
        static var emptyDescription: String { loc("Dashboard.emptyDescription") }
        static var nameHeader: String { loc("Dashboard.nameHeader") }
        static var descriptionHeader: String { loc("Dashboard.descriptionHeader") }

        static func pageOf(_ current: Int, _ total: Int) -> String {
            LocaleManager.currentAppLocale == .es
                ? "Página \(current) de \(total)"
                : "Page \(current) of \(total)"
        }
    }

    enum DeckSort {
        static var updated: String { loc("DeckSort.updated") }
        static var az: String { loc("DeckSort.az") }
        static var za: String { loc("DeckSort.za") }
    }

    enum CardSort {
        static var updated: String { loc("CardSort.updated") }
        static var az: String { loc("CardSort.az") }
        static var za: String { loc("CardSort.za") }
    }

    enum DeckDetail {
        static var backToDecks: String { loc("DeckDetail.backToDecks") }
        static var study: String { loc("DeckDetail.study") }
        static var generateWithAI: String { loc("DeckDetail.generateWithAI") }
        static var addCard: String { loc("DeckDetail.addCard") }
        static var emptyCardsTitle: String { loc("DeckDetail.emptyCardsTitle") }
        static var emptyCardsDescription: String { loc("DeckDetail.emptyCardsDescription") }
        static var addFirstCard: String { loc("DeckDetail.addFirstCard") }
        static var fieldFront: String { loc("DeckDetail.fieldFront") }
        static var fieldBack: String { loc("DeckDetail.fieldBack") }
    }

    enum GenerateCards {
        static var tooltipNeedDescription: String { loc("GenerateCards.tooltipNeedDescription") }
        static var generating: String { loc("GenerateCards.generating") }
        static var failedGeneric: String { loc("GenerateCards.failedGeneric") }
    }

    enum AddCard {
        static var title: String { loc("AddCard.title") }
        static var description: String { loc("AddCard.description") }
        static var frontPlaceholder: String { loc("AddCard.frontPlaceholder") }
        static var backPlaceholder: String { loc("AddCard.backPlaceholder") }
        static var creating: String { loc("AddCard.creating") }
        static var createCard: String { loc("AddCard.createCard") }
        static var triggerDefault: String { loc("AddCard.triggerDefault") }
    }

    enum EditCard {
        static var title: String { loc("EditCard.title") }
        static var description: String { loc("EditCard.description") }
        static var frontPlaceholder: String { loc("EditCard.frontPlaceholder") }
        static var backPlaceholder: String { loc("EditCard.backPlaceholder") }
    }

    enum DeleteCard {
        static var title: String { loc("DeleteCard.title") }
        static var description: String { loc("DeleteCard.description") }
        static var deleting: String { loc("DeleteCard.deleting") }
        static var deleteCard: String { loc("DeleteCard.deleteCard") }
    }

    enum StudyPage {
        static func title(_ name: String) -> String {
            loc("StudyPage.title").replacingOccurrences(of: "{name}", with: name)
        }

        static func backToDeck(_ name: String) -> String {
            loc("StudyPage.backToDeck").replacingOccurrences(of: "{name}", with: name)
        }
    }

    enum StudyClient {
        static var emptyTitle: String { loc("StudyClient.emptyTitle") }
        static var emptyDescription: String { loc("StudyClient.emptyDescription") }
        static var sessionComplete: String { loc("StudyClient.sessionComplete") }
        static var correct: String { loc("StudyClient.correct") }
        static var incorrect: String { loc("StudyClient.incorrect") }
        static var score: String { loc("StudyClient.score") }
        static var savingResults: String { loc("StudyClient.savingResults") }
        static var saveFailed: String { loc("StudyClient.saveFailed") }
        static var shuffleRestart: String { loc("StudyClient.shuffleRestart") }
        static var restart: String { loc("StudyClient.restart") }
        static var shuffle: String { loc("StudyClient.shuffle") }
        static var flipHint: String { loc("StudyClient.flipHint") }
        static var didYouGetIt: String { loc("StudyClient.didYouGetIt") }
        static var previous: String { loc("StudyClient.previous") }
        static var nope: String { loc("StudyClient.nope") }
        static var gotIt: String { loc("StudyClient.gotIt") }
        static var next: String { loc("StudyClient.next") }
        static var revealFinish: String { loc("StudyClient.revealFinish") }
        static var keyboardHints: String { loc("StudyClient.keyboardHints") }

        static func studiedAll(count: Int) -> String {
            loc("StudyClient.studiedAll").replacingOccurrences(of: "{count}", with: "\(count)")
        }

        static func skipped(count: Int) -> String {
            if count == 1 {
                return loc("StudyClient.skippedOne")
            }
            return loc("StudyClient.skippedMany").replacingOccurrences(of: "{count}", with: "\(count)")
        }
    }

    enum Analytics {
        static var title: String { loc("Analytics.title") }
        static var subtitle: String { loc("Analytics.subtitle") }
        static var emptyTitle: String { loc("Analytics.emptyTitle") }
        static var emptyDescription: String { loc("Analytics.emptyDescription") }
        static var goStudy: String { loc("Analytics.goStudy") }
        static var colDeck: String { loc("Analytics.colDeck") }
        static var colTotalCards: String { loc("Analytics.colTotalCards") }
        static var colCorrect: String { loc("Analytics.colCorrect") }
        static var colScore: String { loc("Analytics.colScore") }
    }

    enum Settings {
        static var title: String { loc("Settings.title") }
        static var language: String { loc("Settings.language") }
        static var helperSaving: String { loc("Settings.helperSaving") }
        static var helperDefault: String { loc("Settings.helperDefault") }
        static var save: String { loc("Settings.save") }
        static var saved: String { loc("Settings.saved") }
        static var saveError: String { loc("Settings.saveError") }

        static func languageOption(_ locale: AppLocale) -> String {
            switch locale {
            case .en: loc("Settings.languageOption_en")
            case .es: loc("Settings.languageOption_es")
            }
        }
    }

    enum CreateDeck {
        static var triggerDefault: String { loc("CreateDeck.triggerDefault") }
        static var createFirstDeck: String { loc("CreateDeck.createFirstDeck") }
        static var dialogTitle: String { loc("CreateDeck.dialogTitle") }
        static var dialogDescription: String { loc("CreateDeck.dialogDescriptionSimple") }
        static var dialogDescriptionTabs: String { loc("CreateDeck.dialogDescriptionTabs") }
        static var tabManual: String { loc("CreateDeck.tabManual") }
        static var tabDocument: String { loc("CreateDeck.tabDocument") }
        static var namePlaceholder: String { loc("CreateDeck.namePlaceholder") }
        static var descriptionPlaceholder: String { loc("CreateDeck.descriptionPlaceholder") }
        static var creating: String { loc("CreateDeck.creating") }
        static var createDeck: String { loc("CreateDeck.createDeck") }
        static var limitTitle: String { loc("CreateDeck.limitTitle") }
        static var limitDescription: String { loc("CreateDeck.limitDescription") }
        static var viewPlans: String { loc("CreateDeck.viewPlans") }
        static var docIntro: String { loc("CreateDeck.docIntro") }
        static var chooseFile: String { loc("CreateDeck.chooseFile") }
        static var selected: String { loc("CreateDeck.selected") }
        static var noFileSelected: String { loc("CreateDeck.noFileSelected") }
        static var generating: String { loc("CreateDeck.generating") }
        static var generateDeck: String { loc("CreateDeck.generateDeck") }

        static func docHint(maxMb: Int) -> String {
            loc("CreateDeck.docHint").replacingOccurrences(of: "{maxMb}", with: "\(maxMb)")
        }
    }

    enum EditDeck {
        static var title: String { loc("EditDeck.title") }
        static var description: String { loc("EditDeck.description") }
        static var namePlaceholder: String { loc("EditDeck.namePlaceholder") }
        static var descriptionPlaceholder: String { loc("EditDeck.descriptionPlaceholder") }
    }

    enum DeleteDeck {
        static func title(_ name: String) -> String {
            loc("DeleteDeck.title").replacingOccurrences(of: "{name}", with: name)
        }

        static func description(cardCount: Int) -> String {
            let cardsPart: String
            switch cardCount {
            case 0: cardsPart = loc("DeleteDeck.cardsNone")
            case 1: cardsPart = loc("DeleteDeck.cardsOne")
            default: cardsPart = loc("DeleteDeck.cardsMany").replacingOccurrences(of: "{count}", with: "\(cardCount)")
            }
            return loc("DeleteDeck.description").replacingOccurrences(of: "{cards}", with: cardsPart)
        }

        static var deleteDeck: String { loc("DeleteDeck.deleteDeck") }
        static var deleting: String { loc("DeleteDeck.deleting") }
    }

    enum Actions {
        static var deckLimitReached: String { loc("Actions.deckLimitReached") }
        static var documentDeckProRequired: String { loc("Actions.documentDeckProRequired") }
        static var saveDeckFailed: String { loc("Actions.saveDeckFailed") }
        static var deckNotFound: String { loc("Actions.deckNotFound") }
        static var cardNotFound: String { loc("Actions.cardNotFound") }
        static var unauthorized: String { loc("Actions.unauthorized") }
        static var aiGenProRequired: String { loc("Actions.aiGenProRequired") }
        static var addDescriptionFirst: String { loc("Actions.addDescriptionFirst") }
        static var generateCardsFailed: String { loc("Actions.generateCardsFailed") }
        static var unsupportedFileType: String { loc("Actions.unsupportedFileType") }
        static var fileSizeExceeded: String { loc("Actions.fileSizeExceeded") }
    }

    enum Extension {
        static var loading: String { loc("Extension.loading") }
    }

    enum Auth {
        static var signIn: String { loc("Auth.signIn") }
        static var signUp: String { loc("Auth.signUp") }
    }

    private static func loc(_ key: String) -> String {
        String(localized: String.LocalizationValue(key), locale: LocaleManager.currentLocale)
    }
}

@MainActor
enum LocaleManagerBridge {
    static weak var shared: LocaleManager?
}

extension LocaleManager {
    static var currentLocale: Locale {
        LocaleManagerBridge.shared?.locale ?? Locale(identifier: "en")
    }

    static var currentAppLocale: AppLocale {
        LocaleManagerBridge.shared?.appLocale ?? .en
    }
}
