import ClerkKit
import ClerkKitUI
import SwiftUI

/// Routes signed-out users to the auth gate and signed-in users to the main shell.
struct RootView: View {
    @Environment(Clerk.self) private var clerk
    @State private var authSheetPresented = false

    var body: some View {
        Group {
            if !clerk.isLoaded {
                LoadingView()
            } else if clerk.user != nil {
                MainShellView()
            } else {
                AuthGateView(
                    onSignIn: { authSheetPresented = true },
                    onSignUp: { authSheetPresented = true }
                )
            }
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
            Text("Loading…")
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
