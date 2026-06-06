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
            switch rootPhase {
            case .loading:
                LoadingView()
            case .signedIn:
                APIProvider {
                    MainShellView()
                }
            case .signedOut:
                authGate
            }
        }
        .environment(localeManager)
        .environment(\.locale, localeManager.locale)
        .onAppear {
            LocaleManagerBridge.shared = localeManager
            guard !isUITestingAuthGate else { return }
            localeManager.sync(from: clerk)
        }
        .onChange(of: clerk.user?.id) { _, _ in
            guard !isUITestingAuthGate else { return }
            localeManager.sync(from: clerk)
        }
        .onChange(of: localeManager.appLocale) { _, _ in
            LocaleManagerBridge.shared = localeManager
        }
        .sheet(isPresented: $authSheetPresented) {
            AuthView()
        }
    }

    private var authGate: some View {
        AuthGateView(
            onSignIn: { authSheetPresented = true },
            onSignUp: { authSheetPresented = true }
        )
    }

    private var isUITestingAuthGate: Bool {
        #if DEBUG
        UITestingLaunchSupport.forceAuthGate
        #else
        false
        #endif
    }

    private var rootPhase: RootPhase {
        if isUITestingAuthGate {
            return .signedOut
        }
        if !clerk.isLoaded {
            return .loading
        }
        if clerk.user != nil {
            return .signedIn
        }
        return .signedOut
    }
}

private enum RootPhase {
    case loading
    case signedIn
    case signedOut
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
