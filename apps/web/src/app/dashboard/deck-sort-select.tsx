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

export type DeckSortOption = "updated" | "az" | "za";

interface DeckSortSelectProps {
  currentSort: DeckSortOption;
}

export function DeckSortSelect({ currentSort }: DeckSortSelectProps) {
  const t = useTranslations("DeckSort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const labels: Record<DeckSortOption, string> = {
    updated: t("updated"),
    az: t("az"),
    za: t("za"),
  };

  function handleChange(value: DeckSortOption | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "updated") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>{labels[currentSort]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(labels) as DeckSortOption[]).map((key) => (
          <SelectItem key={key} value={key}>
            {labels[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
