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
      <h2 className="mb-6 text-xl font-bold text-foreground">Similar Artists</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {artists.map((artist) => {
          const imageUrl =
            artist.image?.find((img) => img.size === "large")?.["#text"] ||
            artist.image?.find((img) => img.size === "medium")?.["#text"] ||
            "";

          return (
            <a
              key={artist.name}
              href={artist.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-border">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={`${artist.name} photo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-accent/10">
                    <svg
                      className="h-8 w-8 text-accent"
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
              <p className="text-center text-sm font-medium text-foreground transition-colors group-hover:text-accent truncate w-full">
                {artist.name}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
