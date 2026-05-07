"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserLanguageAction } from "@/actions/locale";
import { normalizeLocale, type AppLocale } from "@/i18n/config";

const LANGUAGE_VALUES: AppLocale[] = ["en", "es"];

/**
 * Renders the custom UserProfile Settings page: language preference with explicit Save.
 */
export function SettingsPage() {
  const t = useTranslations("Settings");
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  /** `null` until synced from Clerk; avoids a wrong first paint before `useUser` resolves. */
  const [draftLocale, setDraftLocale] = useState<AppLocale | null>(null);
  const [baselineLocale, setBaselineLocale] = useState<AppLocale | null>(null);

  const serverLocale = useMemo<AppLocale>(() => {
    if (!user) return "en";
    const meta = user.unsafeMetadata as Record<string, unknown> | undefined;
    return normalizeLocale(meta?.language);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setDraftLocale(serverLocale);
    setBaselineLocale(serverLocale);
  }, [user?.id, serverLocale]);

  const effectiveDraft = draftLocale ?? serverLocale;
  const effectiveBaseline = baselineLocale ?? serverLocale;
  const isDirty = effectiveDraft !== effectiveBaseline;

  useEffect(() => {
    if (isDirty) setSaveMessage(null);
  }, [isDirty]);

  const helperText = isSaving
    ? t("helperSaving")
    : (saveMessage ?? t("helperDefault"));

  async function handleSave() {
    if (!user || !isDirty || isSaving) return;
    setIsSaving(true);
    setSaveMessage(null);

    const result = await updateUserLanguageAction({ locale: effectiveDraft });

    if (result && "error" in result) {
      setSaveMessage(
        typeof result.error === "string" ? result.error : t("saveError"),
      );
    } else {
      const saved = effectiveDraft;
      setSaveMessage(t("saved"));
      setDraftLocale(saved);
      setBaselineLocale(saved);
      // Server action updates Clerk before the client User cache; refresh + remount otherwise
      // shows stale `unsafeMetadata` and resets the select to the old language.
      try {
        await user.reload();
      } catch {
        /* local draft/baseline already match `saved` */
      }
      router.refresh();
    }
    setIsSaving(false);
  }

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <header>
          <h1 className="text-lg font-semibold leading-6 tracking-tight text-foreground">
            {t("title")}
          </h1>
        </header>
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="box-border flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <header>
        <h1 className="text-lg font-semibold leading-6 tracking-tight text-foreground">
          {t("title")}
        </h1>
      </header>
      <Separator className="mt-6" />
      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Label
            htmlFor="language-select"
            className="shrink-0 text-[0.875rem] leading-[18px] font-medium tracking-tight"
          >
            {t("language")}
          </Label>
          <Select
            value={effectiveDraft}
            onValueChange={(v) =>
              setDraftLocale(normalizeLocale(v) as AppLocale)
            }
          >
            <SelectTrigger
              id="language-select"
              size="sm"
              className="w-[128px] px-2 py-0 text-[0.875rem] leading-[18px] font-normal sm:w-[152px] [&_svg]:size-3.5"
            >
              <SelectValue>
                {effectiveDraft === "es"
                  ? t("languageOption_es")
                  : t("languageOption_en")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent portal={false}>
              {LANGUAGE_VALUES.map((key) => (
                <SelectItem key={key} value={key}>
                  {key === "es"
                    ? t("languageOption_es")
                    : t("languageOption_en")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p
          className="min-w-0 text-[0.875rem] leading-[18px] font-normal text-muted-foreground"
          title={helperText}
        >
          {helperText}
        </p>
      </div>
      <footer className="mt-6 flex shrink-0 justify-end border-t border-border pt-4">
        <Button
          type="button"
          size="sm"
          disabled={!isDirty || isSaving}
          onClick={() => void handleSave()}
        >
          {t("save")}
        </Button>
      </footer>
    </div>
  );
}
