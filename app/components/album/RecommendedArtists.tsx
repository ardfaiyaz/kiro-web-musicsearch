import Image from "next/image";
import { Users } from "lucide-react";
import type { LastFmSimilarArtist } from "@/lib/types";

interface RecommendedArtistsProps {
  artists: LastFmSimilarArtist[];
}

export default function RecommendedArtists({
  artists,
}: RecommendedArtistsProps) {
  if (artists.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Recommended artists"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <h2 className="mb-6 text-xl font-bold text-foreground tracking-tight">
        Fans Also Like
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {artists.slice(0, 8).map((artist) => {
          const imageUrl =
            artist.image?.find((img) => img.size === "large")?.["#text"] || "";

          return (
            <div
              key={artist.name}
              className="glass-light group flex items-center gap-3 rounded-2xl p-4 transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-foreground/5">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`${artist.name} photo`}
                    fill
                    sizes="48px"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Users
                      className="h-5 w-5 text-muted"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {artist.name}
                </p>
                {artist.match && (
                  <p className="text-xs text-muted">
                    {Math.round(parseFloat(artist.match) * 100)}% match
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
