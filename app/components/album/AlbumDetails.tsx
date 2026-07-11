import {
  Calendar,
  Music,
  Clock,
  Tag,
  Disc3,
  Globe,
  Shield,
} from "lucide-react";
import type { ItunesAlbum, SpotifyAlbum } from "@/lib/types";

interface AlbumDetailsProps {
  album: ItunesAlbum;
  spotify?: SpotifyAlbum;
  trackCount: number;
  totalDuration: string;
}

export default function AlbumDetails({
  album,
  spotify,
  trackCount,
  totalDuration,
}: AlbumDetailsProps) {
  const releaseDate = album.releaseDate
    ? new Date(album.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const details = [
    {
      icon: Calendar,
      title: "Release Date",
      value: releaseDate,
    },
    {
      icon: Tag,
      title: "Genre",
      value: album.primaryGenreName,
    },
    {
      icon: Music,
      title: "Tracks",
      value: `${trackCount} songs`,
    },
    {
      icon: Clock,
      title: "Duration",
      value: totalDuration,
    },
    {
      icon: Disc3,
      title: "Album Type",
      value: spotify?.albumType
        ? spotify.albumType.charAt(0).toUpperCase() + spotify.albumType.slice(1)
        : album.collectionType || "Album",
    },
    {
      icon: Globe,
      title: "iTunes",
      value: album.collectionViewUrl ? "Available" : "Unavailable",
    },
    ...(album.collectionExplicitness === "explicit"
      ? [
          {
            icon: Shield,
            title: "Content",
            value: "Explicit",
          },
        ]
      : []),
  ].filter((d) => d.value);

  return (
    <section
      aria-label="Album details"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <h2 className="mb-6 text-xl font-bold text-foreground tracking-tight">
        Album Details
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {details.map((detail) => {
          const Icon = detail.icon;
          return (
            <div
              key={detail.title}
              className="glass-light flex items-center gap-3 rounded-xl px-4 py-3"
            >
              <Icon
                className="h-4 w-4 shrink-0 text-muted"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  {detail.title}
                </p>
                <p className="truncate text-sm font-medium text-foreground">
                  {detail.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
