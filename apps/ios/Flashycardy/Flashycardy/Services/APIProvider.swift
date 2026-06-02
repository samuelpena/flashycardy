import ClerkKit
import SwiftUI

private struct FlashycardyAPIKey: EnvironmentKey {
    static let defaultValue: FlashycardyAPI? = nil
}

extension EnvironmentValues {
    var flashycardyAPI: FlashycardyAPI? {
        get { self[FlashycardyAPIKey.self] }
        set { self[FlashycardyAPIKey.self] = newValue }
    }
}

/// Injects a `FlashycardyAPI` using Clerk session tokens (mirrors extension `ApiProvider`).
struct APIProvider<Content: View>: View {
    @Environment(Clerk.self) private var clerk
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        Group {
            if clerk.isLoaded {
                content
                    .environment(\.flashycardyAPI, makeAPI())
            } else {
                ProgressView()
            }
        }
    }

    private func makeAPI() -> FlashycardyAPI {
        FlashycardyAPI(
            configuration: APIClientConfiguration(
                baseURL: AppConfig.apiBaseURL,
                getToken: {
                    try await clerk.auth.getToken()
                }
            )
        )
    }
}

/// Reads `FlashycardyAPI` from the SwiftUI environment.
@propertyWrapper
struct InjectAPI: DynamicProperty {
    @Environment(\.flashycardyAPI) private var api

    var wrappedValue: FlashycardyAPI {
        guard let api else {
            preconditionFailure("FlashycardyAPI missing — wrap content in APIProvider")
        }
        return api
    }
}
