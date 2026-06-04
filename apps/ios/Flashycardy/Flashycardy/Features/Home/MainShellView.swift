import ClerkKit
import ClerkKitUI
import SwiftUI

/// Signed-in shell with dashboard and profile menu (sign out via Clerk `UserButton`).
struct MainShellView: View {
    @Environment(Clerk.self) private var clerk
    @State private var authSheetPresented = false

    var body: some View {
        NavigationStack {
            DashboardView()
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .principal) {
                        Text("FlashyCardy")
                            .font(.headline)
                    }
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

#Preview {
    MainShellView()
        .environment(Clerk.shared)
}
