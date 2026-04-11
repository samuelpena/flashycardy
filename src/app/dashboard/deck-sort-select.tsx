"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DeckSortOption = "updated" | "az" | "za";

const SORT_LABELS: Record<DeckSortOption, string> = {
  updated: "Last updated",
  az: "A → Z",
  za: "Z → A",
};

interface DeckSortSelectProps {
  currentSort: DeckSortOption;
}

export function DeckSortSelect({ currentSort }: DeckSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
        <SelectValue>{SORT_LABELS[currentSort]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(SORT_LABELS) as DeckSortOption[]).map((key) => (
          <SelectItem key={key} value={key}>
            {SORT_LABELS[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
