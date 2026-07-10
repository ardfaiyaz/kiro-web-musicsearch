export function SkeletonText({
  className = "",
  width = "w-full",
}: {
  className?: string;
  width?: string;
}) {
  return (
    <div
      className={`h-4 animate-pulse rounded-lg bg-border ${width} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCircle({
  className = "",
  size = "h-12 w-12",
}: {
  className?: string;
  size?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-full bg-border ${size} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-card ${className}`}
      aria-hidden="true"
    >
      <div className="aspect-square w-full animate-pulse bg-border" />
      <div className="flex flex-col gap-2.5 p-4">
        <SkeletonText width="w-3/4" />
        <SkeletonText width="w-1/2" className="h-3" />
        <div className="mt-1 flex items-center justify-between">
          <SkeletonText width="w-2/5" className="h-3" />
          <SkeletonText width="w-1/5" className="h-3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count = 8,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
      role="status"
      aria-label="Loading content"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
