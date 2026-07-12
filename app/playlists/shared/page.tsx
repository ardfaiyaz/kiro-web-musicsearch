"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Header from "@/app/components/Header";
import { SharedPlaylistImporter } from "@/app/components/CollaborativePlaylist";

function SharedPlaylistContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">
            No Playlist Data
          </h2>
          <p className="mt-2 text-muted">
            This link does not contain valid playlist data.
          </p>
        </div>
      </div>
    );
  }

  return <SharedPlaylistImporter encodedData={data} />;
}

export default function SharedPlaylistPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Shared Playlist
          </h2>
          <p className="mt-2 text-muted">
            Someone shared a playlist with you
          </p>
        </header>
        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
            </div>
          }
        >
          <SharedPlaylistContent />
        </Suspense>
      </div>
    </div>
  );
}
