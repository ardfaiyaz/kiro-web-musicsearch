"use client";

import { useState } from "react";
import type { ItunesAlbum, ItunesTrack, SpotifyAlbum } from "@/lib/types";
import DynamicBackground from "./DynamicBackground";
import AlbumArtwork from "./AlbumArtwork";
import AlbumMetadata from "./AlbumMetadata";
import AlbumHeroActions from "./AlbumHeroActions";
import AlbumStats from "./AlbumStats";
import ArtworkViewer from "./ArtworkViewer";

interface AlbumHeroProps {
  album: ItunesAlbum;
  tracks: ItunesTrack[];
  spotify?: SpotifyAlbum;
  artworkUrl: string | null;
  totalDuration: string;
}

export default function AlbumHero({
  album,
  tracks,
  spotify,
  artworkUrl,
  totalDuration,
}: AlbumHeroProps) {
  const [viewerOpen, setViewerOpen] = useState(false);

  const releaseYear = album.releaseDate
    ? new Date(album.releaseDate).getFullYear().toString()
    : null;

  const previewCount = tracks.filter((t) => t.previewUrl).length;

  return (
    <>
      <section
        className="relative min-h-[70vh] overflow-hidden flex items-end"
        aria-label="Album hero"
      >
        {/* Dynamic cinematic background */}
        <DynamicBackground artworkUrl={artworkUrl} />

        {/* Hero content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
          <article className="flex flex-col items-center gap-10 text-center lg:flex-row lg:items-end lg:gap-12 lg:text-left">
            {/* Artwork */}
            <div
              className="shrink-0 motion-safe:animate-fade-in"
              style={{ animationDelay: "450ms", animationFillMode: "both" }}
            >
              <AlbumArtwork
                artworkUrl={artworkUrl}
                albumName={album.collectionName}
                onOpenViewer={() => setViewerOpen(true)}
              />
            </div>

            {/* Info section */}
            <div className="flex flex-1 flex-col items-center gap-6 lg:items-start">
              {/* Metadata */}
              <div
                className="motion-safe:animate-fade-in"
                style={{ animationDelay: "600ms", animationFillMode: "both" }}
              >
                <AlbumMetadata
                  album={album}
                  spotify={spotify}
                  trackCount={tracks.length}
                  totalDuration={totalDuration}
                />
              </div>

              {/* Actions */}
              <div
                className="motion-safe:animate-fade-in"
                style={{ animationDelay: "900ms", animationFillMode: "both" }}
              >
                <AlbumHeroActions
                  album={album}
                  tracks={tracks}
                  spotify={spotify}
                />
              </div>

              {/* Stats */}
              <div
                className="w-full motion-safe:animate-fade-in"
                style={{ animationDelay: "1050ms", animationFillMode: "both" }}
              >
                <AlbumStats
                  releaseYear={releaseYear}
                  trackCount={tracks.length}
                  totalDuration={totalDuration}
                  popularity={spotify ? undefined : undefined}
                  genreCount={1}
                  previewCount={previewCount}
                />
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Fullscreen artwork viewer */}
      {viewerOpen && artworkUrl && (
        <ArtworkViewer
          artworkUrl={artworkUrl}
          albumName={album.collectionName}
          artistName={album.artistName}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}
