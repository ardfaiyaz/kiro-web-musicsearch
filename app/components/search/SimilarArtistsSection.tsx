import Link from "next/link";
import { Users } from "lucide-react";
import { getSimilarArtists } from "@/lib/lastfm";

interface SimilarArtistsSectionProps {
  artistName: string;
}

export default async function SimilarArtistsSection({ artistName }: SimilarArtistsSectionProps) {
  const similarArtists = await getSimilarArtists(artistName, 12);

  if (similarArtists.length === 0) {
    return (
      <div className="rounded-2xl glass-card p-6 mb-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Users size={18} className="text-muted" aria-hidden="true" />
          <h3 className="text-lg font-bold text-foreground">
            Artists similar to {artistName}
          </h3>
        </div>
        <p className="text-sm text-muted">
          No similar artists found. Try searching for the artist directly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-card p-6 mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-lg font-bold text-foreground">
          Artists similar to {artistName}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {similarArtists.map((artist) => {
          const imageUrl = artist.image?.find((img) => img.size === "large")?.["#text"] || "";
          return (
            <Link
              key={artist.name}
              href={`/search?q=${encodeURIComponent(artist.name)}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:border-foreground/20 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Users size={16} className="text-muted" aria-hidden="true" />
                  </div>
                )}
              </div>
              <span className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                {artist.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
