"use client";

export type CollectionFilterOption =
  | "all"
  | "largest"
  | "smallest"
  | "recently-updated"
  | "recently-created";

interface CollectionFiltersProps {
  active: CollectionFilterOption;
  onChange: (filter: CollectionFilterOption) => void;
}

const FILTERS: { value: CollectionFilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "largest", label: "Largest" },
  { value: "smallest", label: "Smallest" },
  { value: "recently-updated", label: "Recently Updated" },
  { value: "recently-created", label: "Recently Created" },
];

export default function CollectionFilters({
  active,
  onChange,
}: CollectionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter collections">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-accent/50 ${
            active === filter.value
              ? "bg-accent text-white"
              : "glass-subtle text-muted hover:text-foreground hover:bg-foreground/5"
          }`}
          aria-pressed={active === filter.value}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
