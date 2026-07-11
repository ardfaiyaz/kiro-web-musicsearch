"use client";

import Link from "next/link";
import { FolderPlus, Search } from "lucide-react";

interface EmptyCollectionsProps {
  onCreateClick: () => void;
}

export default function EmptyCollections({
  onCreateClick,
}: EmptyCollectionsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-3xl glass-subtle py-20 text-center animate-fade-in">
      {/* Illustration */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-foreground/5">
        <svg
          className="h-12 w-12 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          No Collections Yet
        </h3>
        <p className="max-w-sm text-sm text-muted">
          Create collections to organize your music around moods, activities,
          memories, or any custom theme you prefer.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <FolderPlus className="h-4 w-4" aria-hidden="true" />
          Create Collection
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl glass-medium px-6 py-3 text-sm font-medium text-foreground transition-premium hover-glow hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Discover Music
        </Link>
      </div>
    </div>
  );
}
