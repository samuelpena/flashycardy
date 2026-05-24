"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DeckSortSelect as DeckSortSelectBase, type DeckSortOption } from "@flashycardy/features";

export type { DeckSortOption };

type DeckSortSelectProps = {
  currentSort: DeckSortOption;
};

export function DeckSortSelect({ currentSort }: DeckSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSortChange(value: DeckSortOption) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "updated") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return <DeckSortSelectBase currentSort={currentSort} onSortChange={handleSortChange} />;
}
