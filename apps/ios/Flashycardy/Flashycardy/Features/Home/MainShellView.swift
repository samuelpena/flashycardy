import ClerkKit
import ClerkKitUI
import SwiftUI

/// Signed-in shell: dashboard, analytics, and settings tabs.
struct MainShellView: View {
    @State private var authSheetPresented = false

    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label(L10n.Dashboard.title, systemImage: "rectangle.stack")
                }

            NavigationStack {
                AnalyticsView()
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            ProfileToolbarButton(authSheetPresented: $authSheetPresented)
                        }
                    }
            }
            .tabItem {
                Label(L10n.Analytics.title, systemImage: "chart.bar")
            }

            NavigationStack {
                PreferencesView()
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            ProfileToolbarButton(authSheetPresented: $authSheetPresented)
                        }
                    }
            }
            .tabItem {
                Label(L10n.Settings.title, systemImage: "gearshape")
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
        .environment(LocaleManager())
}
