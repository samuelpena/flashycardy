import ClerkKit
import ClerkKitUI
import SwiftUI

private enum MainTab: Hashable {
    case dashboard
    case analytics
    case settings
}

/// Signed-in shell: dashboard, analytics, and settings tabs.
struct MainShellView: View {
    @Environment(LocaleManager.self) private var localeManager
    @State private var authSheetPresented = false
    @State private var selectedTab = MainTab.dashboard
    @State private var analyticsRefreshToken = 0

    var body: some View {
        let _ = localeManager.appLocale
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Label(L10n.Dashboard.title, systemImage: "rectangle.stack")
                }
                .tag(MainTab.dashboard)

            NavigationStack {
                AnalyticsView(
                    refreshToken: analyticsRefreshToken,
                    isActive: selectedTab == .analytics
                )
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            ProfileToolbarButton(authSheetPresented: $authSheetPresented)
                        }
                    }
            }
            .tabItem {
                Label(L10n.Analytics.title, systemImage: "chart.bar")
            }
            .tag(MainTab.analytics)

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
            .tag(MainTab.settings)
        }
        .onChange(of: selectedTab) { _, tab in
            if tab == .analytics {
                analyticsRefreshToken += 1
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .studySessionDidSave)) { _ in
            analyticsRefreshToken += 1
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
