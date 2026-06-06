import ClerkKit
import ClerkKitUI
import SwiftUI

/// Routes signed-out users to the auth gate and signed-in users to the main shell.
struct RootView: View {
    @Environment(Clerk.self) private var clerk
    @State private var authSheetPresented = false
    @State private var localeManager = LocaleManager()

    var body: some View {
        Group {
            if !clerk.isLoaded {
                LoadingView()
            } else if clerk.user != nil {
                APIProvider {
                    MainShellView()
                }
            } else {
                AuthGateView(
                    onSignIn: { authSheetPresented = true },
                    onSignUp: { authSheetPresented = true }
                )
            }
        }
        .environment(localeManager)
        .environment(\.locale, localeManager.locale)
        .onAppear {
            LocaleManagerBridge.shared = localeManager
            localeManager.sync(from: clerk)
        }
        .onChange(of: clerk.user?.id) { _, _ in
            localeManager.sync(from: clerk)
        }
        .onChange(of: localeManager.appLocale) { _, _ in
            LocaleManagerBridge.shared = localeManager
        }
        .sheet(isPresented: $authSheetPresented) {
            AuthView()
        }
    }
}

private struct LoadingView: View {
    var body: some View {
        VStack(spacing: 12) {
            ProgressView()
            Text(L10n.Extension.loading)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

#Preview {
    RootView()
        .environment(Clerk.shared)
}
