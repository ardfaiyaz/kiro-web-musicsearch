import Link from "next/link";
import type { LastFmSimilarArtist } from "@/lib/types";
import { Users, Percent, ExternalLink } from "lucide-react";

interface ArtistDiscoveryNetworkProps {
  similarArtists: LastFmSimilarArtist[];
  artistName: string;
}

export default function ArtistDiscoveryNetwork({
  similarArtists,
  artistName,
}: ArtistDiscoveryNetworkProps) {
  if (similarArtists.length === 0) {
    return null;
  }

  return (
    <section id="similar-artists" className="animate-on-scroll-slide-up" aria-label="Similar artists and discovery">
      <h2 className="mb-2 text-2xl font-bold text-foreground tracking-tight">
        Discover More
      </h2>
      <p className="mb-8 text-sm text-muted">
        Artists similar to {artistName}
      </p>

      {/* Similar Artists Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {similarArtists.slice(0, 10).map((artist) => {
          const imageUrl =
            artist.image?.find((img) => img.size === "large")?.["#text"] ||
            artist.image?.find((img) => img.size === "medium")?.["#text"] ||
            "";
          const matchPercent = artist.match
            ? Math.round(parseFloat(artist.match) * 100)
            : null;

          return (
            <Link
              key={artist.name}
              href={`/?q=${encodeURIComponent(artist.name)}&filter=artist`}
              className="group flex flex-col items-center gap-3 rounded-2xl glass-light p-5 transition-premium hover-glow hover:border-foreground/10 hover:-translate-y-1"
            >
              {/* Artist image */}
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-border shadow-md sm:h-24 sm:w-24">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={`${artist.name} photo`}
                    className="h-full w-full object-cover transition-premium group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface">
                    <Users className="h-8 w-8 text-muted" aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* Artist name */}
              <p className="w-full truncate text-center text-sm font-semibold text-foreground transition-premium group-hover:text-primary">
                {artist.name}
              </p>

              {/* Match percentage */}
              {matchPercent !== null && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                  <Percent className="h-3 w-3" aria-hidden="true" />
                  {matchPercent}% match
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Fans Also Listen To */}
      {similarArtists.length > 10 && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Fans Also Listen To
          </h3>
          <div className="flex flex-wrap gap-2">
            {similarArtists.slice(10, 20).map((artist) => (
              <Link
                key={artist.name}
                href={`/?q=${encodeURIComponent(artist.name)}&filter=artist`}
                className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-premium hover:border-primary/30 hover:text-primary hover:bg-primary/5"
              >
                {artist.name}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
