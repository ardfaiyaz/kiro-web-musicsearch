"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, ExternalLink } from "lucide-react";
import { useAudioPlayer } from "@/app/components/AudioPlayerContext";
import FavoriteAlbumButton from "@/app/components/FavoriteAlbumButton";
import ShareMenu from "@/app/components/ShareMenu";
import type { ItunesAlbum, ItunesTrack, SpotifyAlbum } from "@/lib/types";

interface StickyAlbumBarProps {
  album: ItunesAlbum;
  tracks: ItunesTrack[];
  spotify?: SpotifyAlbum;
  artworkUrl: string | null;
  heroRef: React.RefObject<HTMLElement | null>;
}

export default function StickyAlbumBar({
  album,
  tracks,
  spotify,
  artworkUrl,
  heroRef,
}: StickyAlbumBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { play, addToQueue } = useAudioPlayer();

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroRef]);

  const playableTrack = tracks.find((t) => t.previewUrl);

  function handlePlay() {
    if (!playableTrack?.previewUrl) return;
    play(playableTrack.previewUrl, playableTrack.trackId, {
      trackName: playableTrack.trackName,
      artistName: playableTrack.artistName,
      artworkUrl: playableTrack.artworkUrl100?.replace("100x100", "200x200"),
      fullTrack: playableTrack,
    });
    const remaining = tracks.filter(
      (t) => t.previewUrl && t.trackId !== playableTrack.trackId
    );
    remaining.forEach((t) => addToQueue(t));
  }

  return (
    <div
      className={`sticky top-[64px] z-40 transition-all duration-[var(--duration-standard)] motion-reduce:transition-none ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isVisible}
    >
      <div className="glass-medium border-b border-border/50">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
          {/* Small artwork */}
          {artworkUrl && (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={artworkUrl}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          )}

          {/* Album info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {album.collectionName}
            </p>
            <p className="truncate text-xs text-muted">{album.artistName}</p>
          </div>

          {/* Quick actions */}
          <div className="hidden items-center gap-2 sm:flex">
            {playableTrack && (
              <button
                type="button"
                onClick={handlePlay}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-text-inverse transition-transform hover:scale-105 motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Play album preview"
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
            <FavoriteAlbumButton album={album} />
            <ShareMenu
              type="album"
              artistName={album.artistName}
              albumName={album.collectionName}
              artworkUrl={album.artworkUrl100}
            />
            {spotify?.spotifyUrl && (
              <a
                href={spotify.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground"
                aria-label="Open on Spotify"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
