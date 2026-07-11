"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface SearchResultsSeeAllProps {
  filter: string;
  query: string;
}

export default function SearchResultsSeeAll({
  filter,
  query,
}: SearchResultsSeeAllProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    params.set("filter", filter);
    router.push(`/?${params.toString()}`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-primary transition-premium hover:text-primary-hover hover:gap-2"
    >
      See all
      <ArrowRight size={14} aria-hidden="true" />
    </button>
  );
}
