import XCTest

final class SmokeTests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testLaunchShowsAuthGateWhenSignedOut() throws {
        let app = XCUIApplication()
        app.launchEnvironment["UITestingForceAuthGate"] = "1"
        app.launch()

        let signInById = app.buttons[AccessibilityID.Auth.signIn]
        let signInByLabel = app.buttons["Sign in"]

        XCTAssertTrue(
            signInById.waitForExistence(timeout: 20) || signInByLabel.waitForExistence(timeout: 5),
            "Sign in control should appear on the auth gate"
        )
        XCTAssertTrue(
            app.buttons[AccessibilityID.Auth.signUp].exists || app.buttons["Sign up"].exists
        )
    }
}

private enum AccessibilityID {
    enum Auth {
        static let signIn = "auth.signIn"
        static let signUp = "auth.signUp"
    }
}
