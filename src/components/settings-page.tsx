"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Label } from "@/components/ui/label";
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
 * Renders a profile settings section that lets users persist language preference.
 */
export function SettingsPage() {
  const { isLoaded, user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const currentLanguage = useMemo<LanguageOption>(() => {
    if (!user) return "en";
    return getLanguageValue(user.unsafeMetadata.language);
  }, [user]);

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
    return <p className="text-sm text-muted-foreground">Loading settings...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="language-select">Language</Label>
        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger id="language-select" className="w-[220px]">
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
      <p className="text-sm text-muted-foreground">
        {isSaving ? "Saving..." : saveMessage ?? "Choose your preferred language."}
      </p>
    </div>
  );
}
