"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  const t = useTranslations("BackButton");

  return (
    <Button variant="ghost" size="sm" onClick={() => router.back()}>
      <ArrowLeft />
      {t("label")}
    </Button>
  );
}
