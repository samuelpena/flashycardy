"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Protect } from "@clerk/chrome-extension";
import { FileTextIcon, LoaderIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNavigate } from "react-router-dom";
import { Button } from "@flashycardy/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@flashycardy/ui/tooltip";
import { mapApiErrorToMessage } from "@/lib/api-error-message";
import { useApi } from "@/lib/api-provider";
import { openPricingTab } from "@/lib/open-pricing";
import {
  extractPageContentFromTab,
  getActiveTabInCurrentWindow,
  isSupportedPageOrigin,
  PAGE_TEXT_MIN_LENGTH,
  truncatePageText,
} from "@/lib/page-content";

function GenerateFromPageButtonInner() {
  const api = useApi();
  const navigate = useNavigate();
  const t = useTranslations("Extension");
  const tActions = useTranslations("Actions");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [tabUrl, setTabUrl] = useState<string | undefined>();
  const [originSupported, setOriginSupported] = useState(true);

  const refreshTab = useCallback(async () => {
    const tab = await getActiveTabInCurrentWindow();
    setTabUrl(tab?.url);
    setOriginSupported(isSupportedPageOrigin(tab?.url).supported);
  }, []);

  useEffect(() => {
    void refreshTab();
    const onFocus = () => void refreshTab();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshTab]);

  function handleGenerate() {
    setError(null);
    setWarning(null);

    startTransition(async () => {
      try {
        const tab = await getActiveTabInCurrentWindow();
        if (!tab?.id || !tab.url) {
          setError(t("originUnsupported"));
          return;
        }

        const origin = isSupportedPageOrigin(tab.url);
        if (!origin.supported) {
          setError(t("originUnsupported"));
          return;
        }

        const raw = await extractPageContentFromTab(tab.id);
        const { text, truncated } = truncatePageText(raw.pageText);
        if (text.length < PAGE_TEXT_MIN_LENGTH) {
          setError(t("pageTooShort"));
          return;
        }
        if (truncated) {
          setWarning(t("pageTruncated"));
        }

        const result = await api.decks.createFromPage({
          pageText: text,
          pageUrl: raw.pageUrl,
          pageTitle: raw.pageTitle,
        });

        navigate(`/decks/${result.deckUuid}`);
      } catch (err) {
        setError(mapApiErrorToMessage(err, tActions));
      }
    });
  }

  const disabled = isPending || !originSupported;

  const button = (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={handleGenerate}
    >
      {isPending ? (
        <LoaderIcon className="size-4 animate-spin" />
      ) : (
        <FileTextIcon className="size-4" />
      )}
      {isPending ? t("generatingFromPage") : t("generateFromPage")}
    </Button>
  );

  return (
    <div className="flex flex-col items-end gap-1">
      {!originSupported ? (
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>{button}</TooltipTrigger>
          <TooltipContent>{t("originUnsupported")}</TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
      {warning && <p className="max-w-[220px] text-right text-xs text-muted-foreground">{warning}</p>}
      {error && <p className="max-w-[220px] text-right text-xs text-destructive">{error}</p>}
      {tabUrl && originSupported && (
        <span className="sr-only">{tabUrl}</span>
      )}
    </div>
  );
}

export function GenerateFromPageButton() {
  const t = useTranslations("Extension");

  return (
    <Protect
      feature="document_deck_generation"
      fallback={
        <Button variant="outline" size="sm" onClick={() => openPricingTab()}>
          <FileTextIcon className="size-4" />
          {t("generateFromPage")}
        </Button>
      }
    >
      <GenerateFromPageButtonInner />
    </Protect>
  );
}
