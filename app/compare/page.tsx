"use client";

import Header from "@/app/components/Header";
import ArtistComparison from "@/app/components/ArtistComparison";
import { GitCompareArrows } from "lucide-react";

export default function ComparePage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-500">
            <GitCompareArrows className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Artist Comparison
          </h1>
          <p className="mt-2 text-muted">
            Compare two artists side-by-side to see how they stack up
          </p>
        </header>

        <ArtistComparison />
      </main>
    </div>
  );
}
