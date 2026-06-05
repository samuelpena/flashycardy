import ClerkKit
import ClerkKitUI
import SwiftUI

/// Signed-in shell: dashboard and analytics tabs plus profile menu.
struct MainShellView: View {
    @Environment(Clerk.self) private var clerk
    @State private var authSheetPresented = false

    var body: some View {
        TabView {
            NavigationStack {
                DashboardView()
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .principal) {
                            Text("FlashyCardy")
                                .font(.headline)
                        }
                        ToolbarItem(placement: .topBarTrailing) {
                            userButton
                        }
                    }
            }
            .tabItem {
                Label(L10n.Dashboard.title, systemImage: "rectangle.stack")
            }

            NavigationStack {
                AnalyticsView()
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            userButton
                        }
                    }
            }
            .tabItem {
                Label(L10n.Analytics.title, systemImage: "chart.bar")
            }
        }
        .sheet(isPresented: $authSheetPresented) {
            AuthView()
        }
    }

    private var userButton: some View {
        UserButton(signedOutContent: {
            Button("Sign in") {
                authSheetPresented = true
            }
        })
    }
}

#Preview {
    MainShellView()
        .environment(Clerk.shared)
}
