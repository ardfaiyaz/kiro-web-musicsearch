import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrackById, getArtistTracks } from "@/lib/itunes";
import AudioPlayer from "@/app/components/AudioPlayer";
import TrackGrid from "@/app/components/TrackGrid";
import ThemeToggle from "@/app/components/ThemeToggle";

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trackId = parseInt(id, 10);

  if (isNaN(trackId)) {
    notFound();
  }

  const track = await getTrackById(trackId);

  if (!track) {
    notFound();
  }

  const recommendationsResult = await getArtistTracks(track.artistId, track.trackId);
  const artworkUrl = track.artworkUrl100?.replace("100x100", "600x600");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted transition-colors hover:text-foreground"
              aria-label="Back to search"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="flex-1 text-lg font-bold text-foreground sm:text-xl">
              <Link href="/" className="hover:text-accent transition-colors">
                Music Search & Discovery
              </Link>
            </h1>
            <ThemeToggle />
            <Link
              href="/favorites"
              className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-red-500"
              aria-label="Favorites"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 8.25c0-3.15-2.7-5.25-5.437-5.25A5.5 5.5 0 0012 5.052 5.5 5.5 0 007.688 3C4.95 3 2.25 5.1 2.25 8.25c0 7.22 9.75 12.75 9.75 12.75s9.75-5.53 9.75-12.75z"
                />
              </svg>
              <span className="hidden sm:inline">Favorites</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <article className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Artwork */}
          <div className="shrink-0">
            <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl shadow-xl lg:w-80">
              {artworkUrl ? (
                <Image
                  src={artworkUrl}
                  alt={`${track.trackName} album artwork`}
                  fill
                  sizes="(max-width: 1024px) 384px, 320px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-card">
                  <svg
                    className="h-20 w-20 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <section className="flex flex-1 flex-col gap-6" aria-label="Track details">
            <header>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                {track.trackName}
              </h2>
              <p className="mt-1 text-lg text-muted">{track.artistName}</p>
            </header>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  Album
                </dt>
                <dd className="text-sm text-foreground">
                  {track.collectionName}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  Genre
                </dt>
                <dd className="text-sm text-foreground">
                  {track.primaryGenreName}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  Release Date
                </dt>
                <dd className="text-sm text-foreground">
                  {formatDate(track.releaseDate)}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  Duration
                </dt>
                <dd className="text-sm text-foreground">
                  {formatDuration(track.trackTimeMillis)}
                </dd>
              </div>
            </dl>

            <div className="mt-2">
              <AudioPlayer
                previewUrl={track.previewUrl}
                trackId={track.trackId}
                trackName={track.trackName}
                artistName={track.artistName}
                artworkUrl={track.artworkUrl100?.replace("100x100", "200x200")}
              />
            </div>
          </section>
        </article>

        {/* Recommendations */}
        {recommendationsResult.error ? (
          <section className="mt-12" aria-label="Recommendations unavailable">
            <h2 className="mb-4 text-xl font-bold text-foreground">
              More from {track.artistName}
            </h2>
            <p className="text-sm text-muted">
              Unable to load recommendations at this time. Please try again later.
            </p>
          </section>
        ) : (
          recommendationsResult.tracks.length > 0 && (
            <section className="mt-12" aria-label="More from this artist">
              <h2 className="mb-6 text-xl font-bold text-foreground">
                More from {track.artistName}
              </h2>
              <TrackGrid tracks={recommendationsResult.tracks} />
            </section>
          )
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        <p>Powered by the iTunes Search API</p>
      </footer>
    </div>
  );
}
