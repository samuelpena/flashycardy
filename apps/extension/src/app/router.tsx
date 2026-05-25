import { Navigate, Route, Routes } from "react-router-dom";
import { ExtensionHeader } from "@/components/extension-header";
import { AnalyticsStubScreen } from "@/screens/analytics-stub";
import { AuthGateScreen } from "@/screens/auth-gate";
import { DashboardStubScreen } from "@/screens/dashboard-stub";
import { DeckDetailStubScreen } from "@/screens/deck-detail-stub";
import { SettingsStubScreen } from "@/screens/settings-stub";
import { StudyStubScreen } from "@/screens/study-stub";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <ExtensionHeader />
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
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
            <DashboardStubScreen />
          </AppLayout>
        }
      />
      <Route
        path="/decks/:deckUuid"
        element={
          <AppLayout>
            <DeckDetailStubScreen />
          </AppLayout>
        }
      />
      <Route
        path="/decks/:deckUuid/study"
        element={
          <AppLayout>
            <StudyStubScreen />
          </AppLayout>
        }
      />
      <Route
        path="/analytics"
        element={
          <AppLayout>
            <AnalyticsStubScreen />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout>
            <SettingsStubScreen />
          </AppLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
