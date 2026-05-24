"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CardSortSelect as CardSortSelectBase, type CardSortOption } from "@flashycardy/features";

export type { CardSortOption };

type CardSortSelectProps = {
  currentSort: CardSortOption;
};

export function CardSortSelect({ currentSort }: CardSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSortChange(value: CardSortOption) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "updated") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return <CardSortSelectBase currentSort={currentSort} onSortChange={handleSortChange} />;
}
