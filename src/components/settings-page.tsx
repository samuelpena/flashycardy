"use client";

import { useMemo, useState } from "react";
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

type LanguageOption = "en" | "es";

const LANGUAGE_OPTIONS: Record<LanguageOption, string> = {
  en: "English",
  es: "Spanish",
};

function getLanguageValue(value: unknown): LanguageOption {
  return value === "es" ? "es" : "en";
}

/**
 * Renders the custom UserProfile Settings page: a page title plus language preference.
 */
export function SettingsPage() {
  const { isLoaded, user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const currentLanguage = useMemo<LanguageOption>(() => {
    if (!user) return "en";
    return getLanguageValue(user.unsafeMetadata.language);
  }, [user]);

  const helperText = isSaving
    ? "Saving..."
    : (saveMessage ?? "Choose your preferred language.");

  async function handleLanguageChange(value: LanguageOption | null) {
    if (!user || !value || value === currentLanguage) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          language: value,
        },
      });
      setSaveMessage("Language saved.");
    } catch {
      setSaveMessage("Unable to save language. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <header>
          <h1 className="text-lg font-semibold leading-6 tracking-tight text-foreground">
            Settings
          </h1>
        </header>
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <header>
        <h1 className="text-lg font-semibold leading-6 tracking-tight text-foreground">
          Settings
        </h1>
      </header>
      <Separator className="mt-6" />
      <div className="mt-4 flex flex-nowrap items-center gap-4">
        <Label
          htmlFor="language-select"
          className="shrink-0 text-base leading-[18px] font-medium tracking-tight"
        >
          Language
        </Label>
        <div className="shrink-0">
          <Select value={currentLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger id="language-select" className="w-[140px] sm:w-[180px]">
              <SelectValue>{LANGUAGE_OPTIONS[currentLanguage]}</SelectValue>
            </SelectTrigger>
            <SelectContent portal={false}>
              {(Object.keys(LANGUAGE_OPTIONS) as LanguageOption[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {LANGUAGE_OPTIONS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p
          className="min-w-0 flex-1 truncate text-sm leading-[18px] text-muted-foreground"
          title={helperText}
        >
          {helperText}
        </p>
      </div>
    </div>
  );
}
