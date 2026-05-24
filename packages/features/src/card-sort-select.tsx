"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@flashycardy/ui/select";

export type CardSortOption = "updated" | "az" | "za";

export type CardSortSelectProps = {
  currentSort: CardSortOption;
  onSortChange: (sort: CardSortOption) => void;
};

export function CardSortSelect({ currentSort, onSortChange }: CardSortSelectProps) {
  const t = useTranslations("CardSort");

  const labels: Record<CardSortOption, string> = {
    updated: t("updated"),
    az: t("az"),
    za: t("za"),
  };

  return (
    <Select
      value={currentSort}
      onValueChange={(value) => {
        if (value) onSortChange(value as CardSortOption);
      }}
    >
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
