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
    @State private var api: FlashycardyAPI?
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        Group {
            if clerk.isLoaded, clerk.session != nil, let api {
                content
                    .environment(\.flashycardyAPI, api)
            } else if clerk.isLoaded, clerk.user != nil {
                VStack(spacing: 12) {
                    ProgressView()
                    Text("Preparing your session…")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ProgressView()
            }
        }
        .task(id: clerk.session?.id) {
            guard clerk.session != nil else {
                api = nil
                return
            }
            api = makeAPI()
        }
    }

    private func makeAPI() -> FlashycardyAPI {
        FlashycardyAPI(
            configuration: APIClientConfiguration(
                baseURL: AppConfig.apiBaseURL,
                getToken: {
                    try await ClerkSessionToken.bearerToken(clerk: clerk)
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
