import { Navigate, Route, Routes } from "react-router-dom";
import { ExtensionHeader } from "@/components/extension-header";
import { RequireAuth } from "@/components/require-auth";
import { AnalyticsScreen } from "@/screens/analytics-screen";
import { AuthGateScreen } from "@/screens/auth-gate";
import { DashboardScreen } from "@/screens/dashboard-screen";
import { DeckDetailScreen } from "@/screens/deck-detail-screen";
import { SettingsScreen } from "@/screens/settings-screen";
import { StudyScreen } from "@/screens/study-screen";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-full flex-col">
        <ExtensionHeader />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </RequireAuth>
  );
}

export function ExtensionRouter() {
  return (
    <Routes>
      <Route path="/" element={<AuthGateScreen />} />
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <DashboardScreen />
          </AppLayout>
        }
      />
      <Route
        path="/decks/:deckUuid"
        element={
          <AppLayout>
            <DeckDetailScreen />
          </AppLayout>
        }
      />
      <Route
        path="/decks/:deckUuid/study"
        element={
          <AppLayout>
            <StudyScreen />
          </AppLayout>
        }
      />
      <Route
        path="/analytics"
        element={
          <AppLayout>
            <AnalyticsScreen />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout>
            <SettingsScreen />
          </AppLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
