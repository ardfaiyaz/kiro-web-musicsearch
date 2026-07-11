"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Play, BadgeCheck } from "lucide-react";
import type { UnifiedArtist, ItunesArtist } from "@/lib/types";
import ArtistActions from "./ArtistActions";

interface ArtistHeroProps {
  artist: ItunesArtist;
  unifiedArtist: UnifiedArtist;
}

export default function ArtistHero({ artist, unifiedArtist }: ArtistHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const artistImage = unifiedArtist.imageUrl || "";
  const isVerified = (unifiedArtist.popularity ?? 0) >= 70;
  const parallaxOffset = scrollY * 0.4;

  return (
    <section
      ref={heroRef}
      className="relative min-h-[85vh] overflow-hidden bg-card flex items-end"
      aria-label={`${artist.artistName} hero section`}
    >
      {/* Parallax background image */}
      {artistImage && (
        <div
          className="absolute inset-0 artist-parallax-bg"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
          aria-hidden="true"
        >
          <Image
            src={artistImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover scale-110 blur-sm opacity-40"
            priority
            aria-hidden="true"
          />
        </div>
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-background/30 to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 text-center animate-fade-in">
          {/* Artist portrait with glow */}
          <div className="relative">
            <div className="artist-portrait-glow absolute -inset-2 rounded-full opacity-60" aria-hidden="true" />
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border-2 border-border/30 shadow-2xl sm:h-52 sm:w-52 lg:h-60 lg:w-60">
              {artistImage ? (
                <Image
                  src={artistImage}
                  alt={`${artist.artistName} photo`}
                  fill
                  sizes="(max-width: 640px) 160px, (max-width: 1024px) 208px, 240px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-foreground/5">
                  <Play className="h-16 w-16 text-muted" aria-hidden="true" />
                </div>
              )}
            </div>
          </div>

          {/* Artist name */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[length:var(--font-size-display-lg)] lg:leading-[var(--leading-display)]">
                {artist.artistName}
              </h1>
              {isVerified && (
                <BadgeCheck
                  className="h-7 w-7 text-primary sm:h-8 sm:w-8"
                  aria-label="Verified artist"
                />
              )}
            </div>
            {unifiedArtist.genres.length > 0 && (
              <p className="text-lg text-text-secondary">
                {unifiedArtist.genres.slice(0, 3).join(" / ")}
              </p>
            )}
          </div>

          {/* Stats pills */}
          {(unifiedArtist.spotify || unifiedArtist.lastfm?.stats) && (
            <div className="flex flex-wrap justify-center gap-3">
              {unifiedArtist.followers && (
                <span className="glass-medium rounded-full px-4 py-2 text-sm font-medium text-foreground">
                  {unifiedArtist.followers.toLocaleString()} followers
                </span>
              )}
              {unifiedArtist.popularity && (
                <span className="glass-medium rounded-full px-4 py-2 text-sm font-medium text-foreground">
                  {unifiedArtist.popularity}% popularity
                </span>
              )}
              {unifiedArtist.lastfm?.stats?.listeners && (
                <span className="glass-medium rounded-full px-4 py-2 text-sm font-medium text-foreground">
                  {parseInt(unifiedArtist.lastfm.stats.listeners).toLocaleString()} listeners
                </span>
              )}
            </div>
          )}

          {/* Genre tags */}
          {unifiedArtist.genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {unifiedArtist.genres.slice(0, 8).map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-medium text-primary"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {unifiedArtist.spotify?.spotifyUrl && (
              <a
                href={unifiedArtist.spotify.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-premium hover:bg-primary-hover hover:scale-105"
                aria-label={`Play ${artist.artistName} on Spotify`}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Play on Spotify
              </a>
            )}
            <ArtistActions artist={artist} />
          </div>
        </div>
      </div>
    </section>
  );
}
