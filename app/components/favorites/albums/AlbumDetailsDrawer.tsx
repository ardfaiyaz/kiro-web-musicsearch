"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ExternalLink, Disc3, Calendar, Music, Hash } from "lucide-react";
import type { ItunesAlbum, ItunesTrack } from "@/lib/types";
import ShimmerSkeleton from "@/app/components/ShimmerSkeleton";
import TracklistPreview from "./TracklistPreview";
import MoreFromArtist from "./MoreFromArtist";
import AlbumRecommendations from "./AlbumRecommendations";

interface AlbumDetailsDrawerProps {
  album: ItunesAlbum | null;
  onClose: () => void;
}

interface AlbumDetails {
  tracks: ItunesTrack[];
  moreAlbums: ItunesAlbum[];
}

export default function AlbumDetailsDrawer({
  album,
  onClose,
}: AlbumDetailsDrawerProps) {
  const [details, setDetails] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const fetchDetails = useCallback(async (collectionId: number, artistId: number) => {
    setLoading(true);
    setError(false);
    setDetails(null);
    try {
      // Fetch album tracks and more from artist in parallel
      const [tracksRes, artistAlbumsRes] = await Promise.all([
        fetch(`https://itunes.apple.com/lookup?id=${collectionId}&entity=song`),
        fetch(`https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=10`),
      ]);

      let tracks: ItunesTrack[] = [];
      if (tracksRes.ok) {
        const tracksData = await tracksRes.json();
        tracks = tracksData.results.filter(
          (item: { wrapperType: string }) => item.wrapperType === "track"
        );
      }

      let moreAlbums: ItunesAlbum[] = [];
      if (artistAlbumsRes.ok) {
        const albumsData = await artistAlbumsRes.json();
        moreAlbums = albumsData.results
          .filter(
            (item: { wrapperType: string; collectionId: number }) =>
              item.wrapperType === "collection" && item.collectionId !== collectionId
          )
          .slice(0, 8);
      }

      setDetails({ tracks, moreAlbums });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (album) {
      fetchDetails(album.collectionId, album.artistId);
    }
  }, [album, fetchDetails]);

  // Focus management and escape key
  useEffect(() => {
    if (!album) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [album, onClose]);

  if (!album) return null;

  const artworkUrl = album.artworkUrl100?.replace("100x100", "600x600");
  const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;
  const totalRuntime = details?.tracks.reduce(
    (sum, t) => sum + (t.trackTimeMillis || 0),
    0
  );
  const runtimeMinutes = totalRuntime ? Math.round(totalRuntime / 60000) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${album.collectionName} details`}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto glass-ultra animate-slide-in-right sm:max-w-md md:max-w-lg"
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between glass-ultra px-4 py-3">
          <h3 className="text-lg font-bold text-foreground truncate">
            {album.collectionName}
          </h3>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-6 p-4 pb-8">
          {loading && (
            <div className="space-y-4" aria-busy="true" aria-label="Loading album details">
              <div className="flex justify-center">
                <ShimmerSkeleton shape="rectangle" width="200px" height="200px" className="rounded-xl" />
              </div>
              <ShimmerSkeleton shape="line" width="60%" height="20px" className="mx-auto" />
              <ShimmerSkeleton shape="rectangle" height="60px" />
              <ShimmerSkeleton shape="rectangle" height="200px" />
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-sm text-muted">
                Could not load album details. Please try again.
              </p>
              <button
                type="button"
                onClick={() => fetchDetails(album.collectionId, album.artistId)}
                className="rounded-xl glass-medium px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && details && (
            <>
              {/* Large Artwork */}
              <div className="flex justify-center">
                <div className="relative h-48 w-48 overflow-hidden rounded-xl shadow-xl sm:h-56 sm:w-56">
                  {artworkUrl ? (
                    <Image
                      src={artworkUrl}
                      alt={`${album.collectionName} artwork`}
                      fill
                      sizes="(max-width: 640px) 192px, 224px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-muted">
                      <Disc3 className="h-16 w-16" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </div>

              {/* Album info */}
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-foreground">
                  {album.collectionName}
                </h4>
                <Link
                  href={`/artist/${album.artistId}`}
                  className="text-sm text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm"
                >
                  {album.artistName}
                </Link>
              </div>

              {/* Meta stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {album.primaryGenreName && (
                  <div className="flex flex-col items-center rounded-xl glass-subtle p-3">
                    <Music className="h-4 w-4 text-accent" aria-hidden="true" />
                    <p className="mt-1 text-xs font-medium text-foreground">
                      {album.primaryGenreName}
                    </p>
                    <p className="text-[10px] text-muted">Genre</p>
                  </div>
                )}
                {releaseYear && !isNaN(releaseYear) && (
                  <div className="flex flex-col items-center rounded-xl glass-subtle p-3">
                    <Calendar className="h-4 w-4 text-accent" aria-hidden="true" />
                    <p className="mt-1 text-xs font-medium text-foreground">
                      {releaseYear}
                    </p>
                    <p className="text-[10px] text-muted">Released</p>
                  </div>
                )}
                {album.trackCount > 0 && (
                  <div className="flex flex-col items-center rounded-xl glass-subtle p-3">
                    <Hash className="h-4 w-4 text-accent" aria-hidden="true" />
                    <p className="mt-1 text-xs font-medium text-foreground">
                      {album.trackCount}
                    </p>
                    <p className="text-[10px] text-muted">Tracks</p>
                  </div>
                )}
                {runtimeMinutes && (
                  <div className="flex flex-col items-center rounded-xl glass-subtle p-3">
                    <Disc3 className="h-4 w-4 text-accent" aria-hidden="true" />
                    <p className="mt-1 text-xs font-medium text-foreground">
                      {runtimeMinutes} min
                    </p>
                    <p className="text-[10px] text-muted">Runtime</p>
                  </div>
                )}
              </div>

              {/* Tracklist */}
              <TracklistPreview tracks={details.tracks} />

              {/* More from artist */}
              <MoreFromArtist
                albums={details.moreAlbums}
                artistName={album.artistName}
              />

              {/* Recommendations */}
              <AlbumRecommendations
                genre={album.primaryGenreName}
                currentAlbumId={album.collectionId}
              />

              {/* External links */}
              <section aria-label="External links" className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">
                  Open in
                </h4>
                <div className="flex flex-wrap gap-2">
                  {album.collectionViewUrl && (
                    <a
                      href={album.collectionViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      Apple Music
                    </a>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
