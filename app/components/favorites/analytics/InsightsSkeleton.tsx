"use client";

import ShimmerSkeleton from "@/app/components/ShimmerSkeleton";

export default function InsightsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in" aria-label="Loading insights" role="status">
      {/* Hero skeleton */}
      <div className="rounded-3xl glass-ultra p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <ShimmerSkeleton className="h-6 w-6 rounded" />
          <ShimmerSkeleton className="h-7 w-40 rounded" />
        </div>
        <ShimmerSkeleton className="h-4 w-64 rounded" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Summary skeleton */}
      <div className="space-y-4">
        <ShimmerSkeleton className="h-6 w-48 rounded" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <ShimmerSkeleton className="h-6 w-32 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <ShimmerSkeleton className="h-6 w-32 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Heatmap skeleton */}
      <div className="space-y-4">
        <ShimmerSkeleton className="h-6 w-48 rounded" />
        <ShimmerSkeleton className="h-32 rounded-xl" />
      </div>

      {/* Achievements skeleton */}
      <div className="space-y-4">
        <ShimmerSkeleton className="h-6 w-36 rounded" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
