import ClerkKit
import ClerkKitUI
import SwiftUI

/// Signed-in shell with profile menu (sign out via Clerk `UserButton`).
struct MainShellView: View {
    @Environment(Clerk.self) private var clerk
    @State private var authSheetPresented = false

    var body: some View {
        NavigationStack {
            PlaceholderHomeView()
                .navigationTitle("FlashyCardy")
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        UserButton(signedOutContent: {
                            Button("Sign in") {
                                authSheetPresented = true
                            }
                        })
                    }
                }
        }
        .sheet(isPresented: $authSheetPresented) {
            AuthView()
        }
    }
}

/// PR-3 replaces this with the real dashboard.
private struct PlaceholderHomeView: View {
    @Environment(Clerk.self) private var clerk

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "rectangle.stack.fill")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text("Dashboard")
                .font(.title2.bold())

            Text("Deck list and study flows ship in PR-3.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            if let email = clerk.user?.primaryEmailAddress?.emailAddress {
                Text(email)
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    MainShellView()
        .environment(Clerk.shared)
}
