"use client";

import ShimmerSkeleton from "@/app/components/ShimmerSkeleton";

export default function RecentlyPlayedSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in" aria-label="Loading listening history" role="status">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden rounded-3xl glass-ultra p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <ShimmerSkeleton shape="line" width="200px" height="32px" />
            <ShimmerSkeleton shape="line" width="300px" height="20px" />
            <div className="flex gap-4">
              <ShimmerSkeleton shape="rectangle" width="100px" height="60px" />
              <ShimmerSkeleton shape="rectangle" width="100px" height="60px" />
              <ShimmerSkeleton shape="rectangle" width="100px" height="60px" />
            </div>
          </div>
          <ShimmerSkeleton shape="rectangle" width="180px" height="180px" className="rounded-2xl" />
        </div>
      </div>

      {/* Continue Listening Skeleton */}
      <div className="space-y-4">
        <ShimmerSkeleton shape="line" width="180px" height="24px" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`continue-${i}`} className="rounded-2xl glass-heavy p-4 space-y-3">
              <div className="flex items-center gap-3">
                <ShimmerSkeleton shape="rectangle" width="48px" height="48px" className="rounded-lg" />
                <div className="flex-1 space-y-2">
                  <ShimmerSkeleton shape="line" width="80%" height="14px" />
                  <ShimmerSkeleton shape="line" width="60%" height="12px" />
                </div>
              </div>
              <ShimmerSkeleton shape="line" width="100%" height="6px" />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="space-y-4">
        <ShimmerSkeleton shape="line" width="120px" height="20px" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`timeline-${i}`} className="flex items-center gap-4 rounded-xl glass-light p-3">
            <ShimmerSkeleton shape="rectangle" width="40px" height="40px" className="rounded-lg" />
            <div className="flex-1 space-y-2">
              <ShimmerSkeleton shape="line" width="60%" height="14px" />
              <ShimmerSkeleton shape="line" width="40%" height="12px" />
            </div>
            <ShimmerSkeleton shape="line" width="50px" height="12px" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading listening history...</span>
    </div>
  );
}
