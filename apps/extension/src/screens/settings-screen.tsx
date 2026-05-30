"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/chrome-extension";
import { useTranslations } from "next-intl";
import { Button } from "@flashycardy/ui/button";
import { Label } from "@flashycardy/ui/label";
import { Separator } from "@flashycardy/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@flashycardy/ui/select";
import { locales, normalizeLocale, type AppLocale } from "@flashycardy/i18n";

const LANGUAGE_VALUES: AppLocale[] = [...locales];

export function SettingsScreen() {
  const t = useTranslations("Settings");
  const tExt = useTranslations("Extension");
  const { isLoaded, user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
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

  async function handleSave() {
    if (!user || !isDirty || isSaving) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const prev = user.unsafeMetadata;
      const base =
        prev && typeof prev === "object" && !Array.isArray(prev)
          ? { ...(prev as Record<string, unknown>) }
          : {};

      await user.update({
        unsafeMetadata: { ...base, language: effectiveDraft },
      });
      await user.reload();
      setSaveMessage(t("saved"));
      setDraftLocale(effectiveDraft);
      setBaselineLocale(effectiveDraft);
      window.location.reload();
    } catch {
      setSaveMessage(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoaded) {
    return <p className="text-sm text-muted-foreground">{tExt("loading")}</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <header>
        <h1 className="text-lg font-semibold leading-6 tracking-tight text-foreground">
          {t("title")}
        </h1>
      </header>
      <Separator />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Label htmlFor="language-select" className="shrink-0 text-sm font-medium">
            {t("language")}
          </Label>
          <Select
            value={effectiveDraft}
            onValueChange={(v) => setDraftLocale(normalizeLocale(v) as AppLocale)}
          >
            <SelectTrigger id="language-select" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_VALUES.map((code) => (
                <SelectItem key={code} value={code}>
                  {t(`languageOption_${code}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          {isSaving ? t("helperSaving") : (saveMessage ?? t("helperDefault"))}
        </p>
        <Button onClick={() => void handleSave()} disabled={!isDirty || isSaving}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
