"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CardSortOption = "updated" | "az" | "za";

interface CardSortSelectProps {
  currentSort: CardSortOption;
}

export function CardSortSelect({ currentSort }: CardSortSelectProps) {
  const t = useTranslations("CardSort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const labels: Record<CardSortOption, string> = {
    updated: t("updated"),
    az: t("az"),
    za: t("za"),
  };

  function handleChange(value: CardSortOption | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "updated") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>{labels[currentSort]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(labels) as CardSortOption[]).map((key) => (
          <SelectItem key={key} value={key}>
            {labels[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
