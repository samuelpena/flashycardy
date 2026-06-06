import XCTest

final class L10nTests: XCTestCase {
    func testSettingsTitleUsesSpanishCatalogEntry() {
        let resource = LocalizedStringResource(
            String.LocalizationValue(stringLiteral: "Settings.title"),
            locale: Locale(identifier: "es")
        )

        XCTAssertEqual(String(localized: resource), "Ajustes")
    }

    func testSettingsTitleUsesEnglishCatalogEntry() {
        let resource = LocalizedStringResource(
            String.LocalizationValue(stringLiteral: "Settings.title"),
            locale: Locale(identifier: "en")
        )

        XCTAssertEqual(String(localized: resource), "Settings")
    }
}
