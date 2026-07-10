import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrackById, getArtistTracks, searchTracksByGenre } from "@/lib/itunes";
import AudioPlayer from "@/app/components/AudioPlayer";
import TrackGrid from "@/app/components/TrackGrid";
import ExplicitBadge from "@/app/components/ExplicitBadge";
import Header from "@/app/components/Header";
import ShareMenu from "@/app/components/ShareMenu";

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
  const similarTracks = await searchTracksByGenre(track.primaryGenreName, track.trackId);
  const artworkUrl = track.artworkUrl100?.replace("100x100", "600x600");

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />

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
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {track.trackName}
                </h2>
                {track.trackExplicitness === "explicit" && <ExplicitBadge />}
              </div>
              <p className="mt-1 text-lg text-muted">
                <Link
                  href={`/artist/${track.artistId}`}
                  className="transition-colors hover:text-accent"
                >
                  {track.artistName}
                </Link>
              </p>
            </header>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  Album
                </dt>
                <dd className="text-sm text-foreground">
                  {track.collectionId ? (
                    <Link
                      href={`/album/${track.collectionId}`}
                      className="transition-colors hover:text-accent"
                    >
                      {track.collectionName}
                    </Link>
                  ) : (
                    track.collectionName
                  )}
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

            <div className="mt-4">
              <ShareMenu
                type="track"
                trackName={track.trackName}
                artistName={track.artistName}
                albumName={track.collectionName}
                artworkUrl={track.artworkUrl100}
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

        {/* Similar Tracks by Genre */}
        {similarTracks.length > 0 && (
          <section className="mt-12" aria-label="Similar tracks">
            <h2 className="mb-6 text-xl font-bold text-foreground">
              Similar Tracks in {track.primaryGenreName}
            </h2>
            <TrackGrid tracks={similarTracks} />
          </section>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        <p>Powered by the iTunes Search API</p>
      </footer>
    </div>
  );
}
