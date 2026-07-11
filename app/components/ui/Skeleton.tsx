"use client";

import { memo } from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string;
  height?: string;
}

function SkeletonBase({ className = "", variant = "rectangular", width, height }: SkeletonProps) {
  const baseClasses = "shimmer-wave";
  const variantClasses = {
    text: "h-4 w-full rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-2xl",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
      role="presentation"
      aria-hidden="true"
    />
  );
}

export const Skeleton = memo(SkeletonBase);

function SkeletonCardBase({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card ${className}`}>
      <Skeleton variant="rectangular" className="aspect-square w-full" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton variant="text" className="h-4 w-3/4" />
        <Skeleton variant="text" className="h-3 w-1/2" />
        <div className="mt-2 flex items-center justify-between">
          <Skeleton variant="text" className="h-3 w-1/3" />
          <Skeleton variant="text" className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export const SkeletonCard = memo(SkeletonCardBase);

function SkeletonTrackBase({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 rounded-xl p-3 ${className}`}>
      <Skeleton variant="rectangular" className="h-12 w-12 shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton variant="text" className="h-4 w-2/3" />
        <Skeleton variant="text" className="h-3 w-1/3" />
      </div>
      <Skeleton variant="text" className="h-3 w-10 shrink-0" />
    </div>
  );
}

export const SkeletonTrack = memo(SkeletonTrackBase);

function SkeletonArtistBase({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl p-4 ${className}`}>
      <Skeleton variant="circular" className="h-16 w-16 shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton variant="text" className="h-4 w-1/2" />
        <Skeleton variant="text" className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export const SkeletonArtist = memo(SkeletonArtistBase);

export default Skeleton;
