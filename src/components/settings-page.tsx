"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
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
 * Renders the custom UserProfile Settings page: a page title plus language preference.
 */
export function SettingsPage() {
  const t = useTranslations("Settings");
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  /** Clerk `useUser()` metadata lags behind server updates; keep UI in sync until the client refetches. */
  const [optimisticLocale, setOptimisticLocale] = useState<AppLocale | null>(
    null,
  );

  const serverLocale = useMemo<AppLocale>(() => {
    if (!user) return "en";
    const meta = user.unsafeMetadata as Record<string, unknown> | undefined;
    return normalizeLocale(meta?.language);
  }, [user]);

  const selectedLocale = optimisticLocale ?? serverLocale;

  useEffect(() => {
    setOptimisticLocale(null);
  }, [user?.id]);

  useEffect(() => {
    if (optimisticLocale != null && optimisticLocale === serverLocale) {
      setOptimisticLocale(null);
    }
  }, [optimisticLocale, serverLocale]);

  const helperText = isSaving
    ? t("helperSaving")
    : (saveMessage ?? t("helperDefault"));

  async function handleLanguageChange(value: AppLocale | null) {
    if (!user || !value || value === selectedLocale) return;
    setOptimisticLocale(value);
    setIsSaving(true);
    setSaveMessage(null);

    const result = await updateUserLanguageAction({ locale: value });

    if (result && "error" in result) {
      setOptimisticLocale(null);
      setSaveMessage(
        typeof result.error === "string" ? result.error : t("saveError"),
      );
    } else {
      setSaveMessage(t("saved"));
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
    <div>
      <header>
        <h1 className="text-lg font-semibold leading-6 tracking-tight text-foreground">
          {t("title")}
        </h1>
      </header>
      <Separator className="mt-6" />
      <div className="mt-4 flex flex-nowrap items-center gap-4">
        <Label
          htmlFor="language-select"
          className="shrink-0 text-[0.875rem] leading-[18px] font-medium tracking-tight"
        >
          {t("language")}
        </Label>
        <div className="shrink-0">
          <Select
            value={selectedLocale}
            onValueChange={(v) =>
              handleLanguageChange(normalizeLocale(v) as AppLocale)
            }
          >
            <SelectTrigger
              id="language-select"
              size="sm"
              className="w-[128px] px-2 py-0 text-[0.875rem] leading-[18px] font-normal sm:w-[152px] [&_svg]:size-3.5"
            >
              <SelectValue>
                {selectedLocale === "es"
                  ? t("languageOption_es")
                  : t("languageOption_en")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent portal={false}>
              {LANGUAGE_VALUES.map((key) => (
                <SelectItem key={key} value={key}>
                  {key === "es" ? t("languageOption_es") : t("languageOption_en")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p
          className="min-w-0 flex-1 truncate text-[0.875rem] leading-[18px] font-normal text-muted-foreground"
          title={helperText}
        >
          {helperText}
        </p>
      </div>
    </div>
  );
}
