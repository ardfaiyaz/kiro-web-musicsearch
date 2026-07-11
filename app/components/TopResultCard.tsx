import Image from "next/image";
import Link from "next/link";
import { Play, Music, User, Disc3 } from "lucide-react";
import { ItunesTrack, ItunesArtist, ItunesAlbum } from "@/lib/types";

type TopResultType = "track" | "artist" | "album";

interface TopResultCardProps {
  track?: ItunesTrack;
  artist?: ItunesArtist;
  album?: ItunesAlbum;
  type: TopResultType;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TopResultCard({
  track,
  artist,
  album,
  type,
}: TopResultCardProps) {
  let href = "#";
  let imageUrl = "";
  let title = "";
  let subtitle = "";
  let meta = "";
  let TypeIcon = Music;

  if (type === "track" && track) {
    href = `/track/${track.trackId}`;
    imageUrl = track.artworkUrl100?.replace("100x100", "400x400") || "";
    title = track.trackName;
    subtitle = track.artistName;
    meta = track.trackTimeMillis ? formatDuration(track.trackTimeMillis) : "";
    TypeIcon = Music;
  } else if (type === "artist" && artist) {
    href = `/artist/${artist.artistId}`;
    imageUrl = artist.artworkUrl100?.replace("100x100", "400x400") || "";
    title = artist.artistName;
    subtitle = artist.primaryGenreName || "Artist";
    TypeIcon = User;
  } else if (type === "album" && album) {
    href = `/album/${album.collectionId}`;
    imageUrl = album.artworkUrl100?.replace("100x100", "400x400") || "";
    title = album.collectionName;
    subtitle = album.artistName;
    meta = `${album.trackCount} ${album.trackCount === 1 ? "track" : "tracks"}`;
    TypeIcon = Disc3;
  }

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl glass-card transition-premium hover:shadow-xl hover:shadow-black/5 hover:border-foreground/10 sm:flex-row"
      aria-label={`Top result: ${title} by ${subtitle}`}
    >
      {/* Artwork */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-border sm:w-48 md:w-56">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${title} artwork`}
            fill
            sizes="(max-width: 640px) 100vw, 224px"
            className="object-cover transition-premium group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <TypeIcon size={48} className="text-muted" aria-hidden="true" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-premium group-hover:bg-black/30">
          <div className="rounded-full bg-primary p-3 opacity-0 transition-premium group-hover:opacity-100 group-hover:scale-100 scale-75">
            <Play size={20} fill="white" className="text-white" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center gap-2 p-5 sm:p-6">
        {/* Type badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <TypeIcon size={10} aria-hidden="true" />
            {type === "track" ? "Song" : type}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
            Top Result
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight text-foreground transition-premium group-hover:text-primary sm:text-2xl">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-muted sm:text-base">{subtitle}</p>

        {/* Meta */}
        {meta && (
          <p className="text-xs text-muted/70">{meta}</p>
        )}
      </div>
    </Link>
  );
}
