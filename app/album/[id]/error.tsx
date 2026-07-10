"use client";

import Link from "next/link";

export default function AlbumError() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <svg
        className="mb-4 h-16 w-16 text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <h2 className="mb-2 text-xl font-bold text-foreground">
        Failed to load album
      </h2>
      <p className="mb-6 text-center text-muted">
        We could not load the album details. Please try again later.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
      >
        Return to Search
      </Link>
    </div>
  );
}
