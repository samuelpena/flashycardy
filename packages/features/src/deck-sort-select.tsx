"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@flashycardy/ui/select";

export type DeckSortOption = "updated" | "az" | "za";

export type DeckSortSelectProps = {
  currentSort: DeckSortOption;
  onSortChange: (sort: DeckSortOption) => void;
};

export function DeckSortSelect({ currentSort, onSortChange }: DeckSortSelectProps) {
  const t = useTranslations("DeckSort");

  const labels: Record<DeckSortOption, string> = {
    updated: t("updated"),
    az: t("az"),
    za: t("za"),
  };

  return (
    <Select
      value={currentSort}
      onValueChange={(value) => {
        if (value) onSortChange(value as DeckSortOption);
      }}
    >
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
