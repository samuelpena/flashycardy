import { useClerk } from "@clerk/chrome-extension";
import { useTranslations } from "next-intl";
import { useNavigate } from "react-router-dom";
import { Button } from "@flashycardy/ui/button";

export function SettingsStubScreen() {
  const t = useTranslations("Extension");
  const auth = useTranslations("Auth");
  const clerk = useClerk();
  const navigate = useNavigate();

  async function handleSignOut() {
    await clerk.signOut();
    await chrome.storage.local.clear();
    navigate("/", { replace: true });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Settings</h2>
      <p className="text-sm text-muted-foreground">{t("settingsPlaceholder")}</p>
      <Button variant="outline" onClick={() => void handleSignOut()}>
        {auth("signOut")}
      </Button>
    </div>
  );
}
