"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ExternalLink, Users, Star } from "lucide-react";
import type { ItunesArtist, SpotifyArtist, SpotifyTrack, SpotifyAlbum } from "@/lib/types";
import ShimmerSkeleton from "@/app/components/ShimmerSkeleton";
import TopSongsPreview from "./TopSongsPreview";
import DiscographyPreview from "./DiscographyPreview";
import SimilarArtistsPanel from "./SimilarArtistsPanel";

interface ArtistDetailsDrawerProps {
  artist: ItunesArtist | null;
  onClose: () => void;
}

interface ArtistDetails {
  spotify: SpotifyArtist | null;
  topTracks: SpotifyTrack[];
  albums: SpotifyAlbum[];
  similar: { name: string; imageUrl?: string; genres: string[]; reason: string }[];
}

export default function ArtistDetailsDrawer({
  artist,
  onClose,
}: ArtistDetailsDrawerProps) {
  const [details, setDetails] = useState<ArtistDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const fetchDetails = useCallback(async (artistName: string) => {
    setLoading(true);
    setError(false);
    setDetails(null);
    setBioExpanded(false);
    try {
      const res = await fetch(
        `/api/spotify/artist?name=${encodeURIComponent(artistName)}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      const spotifyArtist: SpotifyArtist | null = data.artist || null;

      setDetails({
        spotify: spotifyArtist,
        topTracks: data.artist?.topTracks || [],
        albums: data.artist?.albums || [],
        similar: (data.artist?.relatedArtists || []).map(
          (a: { name: string; images?: { url: string }[]; genres?: string[] }) => ({
            name: a.name,
            imageUrl: a.images?.[0]?.url,
            genres: a.genres || [],
            reason: `Similar to ${artistName}`,
          })
        ),
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (artist) {
      fetchDetails(artist.artistName);
    }
  }, [artist, fetchDetails]);

  // Trap focus and handle escape
  useEffect(() => {
    if (!artist) return;

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
  }, [artist, onClose]);

  if (!artist) return null;

  const artworkUrl = artist.artworkUrl100?.replace("100x100", "600x600");
  const spotifyImage = details?.spotify?.images?.[0]?.url;
  const displayImage = spotifyImage || artworkUrl;

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
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${artist.artistName} details`}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto glass-ultra animate-slide-in-right sm:max-w-md md:max-w-lg"
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between glass-ultra px-4 py-3">
          <h3 className="text-lg font-bold text-foreground truncate">
            {artist.artistName}
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
            <div className="space-y-4" aria-busy="true" aria-label="Loading artist details">
              <div className="flex justify-center">
                <ShimmerSkeleton shape="circle" width="160px" height="160px" />
              </div>
              <ShimmerSkeleton shape="line" width="60%" height="20px" className="mx-auto" />
              <ShimmerSkeleton shape="rectangle" height="60px" />
              <ShimmerSkeleton shape="rectangle" height="200px" />
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-sm text-muted">
                Could not load artist details. Please try again.
              </p>
              <button
                type="button"
                onClick={() => fetchDetails(artist.artistName)}
                className="rounded-xl glass-medium px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && details && (
            <>
              {/* Large Portrait */}
              <div className="flex justify-center">
                <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-xl sm:h-48 sm:w-48">
                  {displayImage ? (
                    <Image
                      src={displayImage}
                      alt={`${artist.artistName} portrait`}
                      fill
                      sizes="(max-width: 640px) 160px, 192px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-muted">
                      <Users className="h-16 w-16" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </div>

              {/* Genres */}
              {details.spotify?.genres && details.spotify.genres.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {details.spotify.genres.slice(0, 5).map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full glass-subtle px-3 py-1 text-xs text-muted"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {details.spotify?.followers != null && (
                  <div className="flex flex-col items-center rounded-xl glass-subtle p-3">
                    <Users className="h-4 w-4 text-accent" aria-hidden="true" />
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {details.spotify.followers.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted">Followers</p>
                  </div>
                )}
                {details.spotify?.popularity != null && (
                  <div className="flex flex-col items-center rounded-xl glass-subtle p-3">
                    <Star className="h-4 w-4 text-accent" aria-hidden="true" />
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {details.spotify.popularity}/100
                    </p>
                    <p className="text-[10px] text-muted">Popularity</p>
                  </div>
                )}
              </div>

              {/* Biography placeholder */}
              {details.spotify && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">About</h4>
                  <p className={`text-xs text-muted leading-relaxed ${!bioExpanded ? "line-clamp-3" : ""}`}>
                    {artist.artistName} is a {artist.primaryGenreName || "music"} artist
                    {details.spotify.genres.length > 0 &&
                      ` known for ${details.spotify.genres.slice(0, 3).join(", ")}`}
                    {details.spotify.followers > 0 &&
                      `, with ${details.spotify.followers.toLocaleString()} followers on Spotify`}
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => setBioExpanded(!bioExpanded)}
                    className="text-xs text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm"
                  >
                    {bioExpanded ? "Show less" : "Read more"}
                  </button>
                </div>
              )}

              {/* Top Songs */}
              <TopSongsPreview tracks={details.topTracks} />

              {/* Discography */}
              <DiscographyPreview albums={details.albums} />

              {/* Similar Artists */}
              <SimilarArtistsPanel
                artists={details.similar}
                sourceArtistName={artist.artistName}
              />

              {/* External Links */}
              <section aria-label="External links" className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">
                  Listen on
                </h4>
                <div className="flex flex-wrap gap-2">
                  {details.spotify?.spotifyUrl && (
                    <a
                      href={details.spotify.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      Spotify
                    </a>
                  )}
                  <a
                    href={`https://www.last.fm/music/${encodeURIComponent(artist.artistName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    Last.fm
                  </a>
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
