import Link from "next/link";
import { LastFmSimilarArtist } from "@/lib/types";

export default function SimilarArtists({
  artists,
}: {
  artists: LastFmSimilarArtist[];
}) {
  if (artists.length === 0) {
    return null;
  }

  return (
    <section aria-label="Similar artists">
      <h2 className="mb-6 text-xl font-bold text-foreground tracking-tight">
        Similar Artists
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {artists.map((artist) => {
          const imageUrl =
            artist.image?.find((img) => img.size === "large")?.["#text"] ||
            artist.image?.find((img) => img.size === "medium")?.["#text"] ||
            "";

          return (
            <Link
              key={artist.name}
              href={`/?q=${encodeURIComponent(artist.name)}&filter=artist`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-premium hover:border-foreground/10 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-border shadow-md">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={`${artist.name} photo`}
                    className="h-full w-full object-cover transition-premium group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-foreground/5">
                    <svg
                      className="h-8 w-8 text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-center text-sm font-medium text-foreground transition-premium group-hover:text-accent truncate w-full">
                {artist.name}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
