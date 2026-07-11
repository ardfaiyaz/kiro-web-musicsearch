import { ExternalLink, Music, Tv } from "lucide-react";
import type { ItunesAlbum, SpotifyAlbum } from "@/lib/types";

interface ExternalLinksProps {
  album: ItunesAlbum;
  spotify?: SpotifyAlbum;
}

export default function ExternalLinks({
  album,
  spotify,
}: ExternalLinksProps) {
  const links = [
    ...(spotify?.spotifyUrl
      ? [
          {
            label: "Open on Spotify",
            url: spotify.spotifyUrl,
            icon: Music,
          },
        ]
      : []),
    ...(album.collectionViewUrl
      ? [
          {
            label: "Open on Apple Music",
            url: album.collectionViewUrl,
            icon: Music,
          },
        ]
      : []),
    {
      label: "Search on YouTube",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${album.artistName} ${album.collectionName}`
      )}`,
      icon: Tv,
    },
  ];

  if (links.length === 0) return null;

  return (
    <section
      aria-label="External links"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <h2 className="mb-6 text-xl font-bold text-foreground tracking-tight">
        Listen Elsewhere
      </h2>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-light inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:scale-[1.03] hover:shadow-md motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
              <ExternalLink className="h-3 w-3 text-muted" aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </section>
  );
}
