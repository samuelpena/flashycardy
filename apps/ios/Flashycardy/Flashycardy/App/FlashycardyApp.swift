import ClerkKit
import ClerkKitUI
import SwiftUI

@main
struct FlashycardyApp: App {
    init() {
        let publishableKey = AppConfig.clerkPublishableKey
        precondition(
            !publishableKey.isEmpty && !publishableKey.contains("REPLACE"),
            "Set CLERK_PUBLISHABLE_KEY in apps/ios/Config/Secrets.xcconfig (see Secrets.xcconfig.example)."
        )

        Clerk.configure(
            publishableKey: publishableKey,
            options: Clerk.Options(
                logLevel: .error,
                redirectConfig: .init(
                    redirectUrl: AppConfig.oauthRedirectURL,
                    callbackUrlScheme: AppConfig.oauthCallbackScheme
                )
            )
        )
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(Clerk.shared)
                .preferredColorScheme(.dark)
        }
    }
}
