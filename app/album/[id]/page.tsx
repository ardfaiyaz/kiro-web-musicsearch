import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAlbumTracks } from "@/lib/itunes";
import AudioPlayer from "@/app/components/AudioPlayer";
import ExplicitBadge from "@/app/components/ExplicitBadge";
import Header from "@/app/components/Header";
import AlbumActions from "@/app/components/AlbumActions";

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatYear(dateString: string): string {
  return new Date(dateString).getFullYear().toString();
}

function totalDuration(tracks: { trackTimeMillis: number }[]): string {
  const totalMs = tracks.reduce((sum, t) => sum + (t.trackTimeMillis || 0), 0);
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const albumId = parseInt(id, 10);

  if (isNaN(albumId)) {
    notFound();
  }

  const albumDetail = await getAlbumTracks(albumId);

  if (!albumDetail) {
    notFound();
  }

  const { album, tracks } = albumDetail;
  const artworkUrl = album.artworkUrl100?.replace("100x100", "600x600");

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <article>
          {/* Album Header */}
          <header className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <div className="shrink-0">
              <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-2xl shadow-xl lg:w-72">
                {artworkUrl ? (
                  <Image
                    src={artworkUrl}
                    alt={`${album.collectionName} album artwork`}
                    fill
                    sizes="(max-width: 1024px) 320px, 288px"
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

            <section className="flex flex-1 flex-col gap-4" aria-label="Album details">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                {album.collectionName}
              </h2>
              <p className="text-lg text-muted">
                <Link
                  href={`/artist/${album.artistId}`}
                  className="transition-colors hover:text-accent"
                >
                  {album.artistName}
                </Link>
              </p>

              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                    Year
                  </dt>
                  <dd className="text-sm text-foreground">
                    {album.releaseDate ? formatYear(album.releaseDate) : "N/A"}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                    Genre
                  </dt>
                  <dd className="text-sm text-foreground">
                    {album.primaryGenreName}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                    Tracks
                  </dt>
                  <dd className="text-sm text-foreground">
                    {tracks.length} songs, {totalDuration(tracks)}
                  </dd>
                </div>
              </dl>

              {album.collectionExplicitness === "explicit" && (
                <div className="flex items-center gap-2">
                  <ExplicitBadge />
                  <span className="text-xs text-muted">Explicit content</span>
                </div>
              )}

              <AlbumActions album={album} />
            </section>
          </header>

          {/* Track Listing */}
          <section className="mt-10" aria-label="Track listing">
            <h2 className="mb-4 text-xl font-bold text-foreground">
              Track Listing
            </h2>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-card/50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted w-12">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Title
                    </th>
                    <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted sm:table-cell">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted w-20">
                      Play
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track, index) => (
                    <tr
                      key={track.trackId}
                      className="border-b border-border last:border-b-0 transition-colors hover:bg-card/50"
                    >
                      <td className="px-4 py-3 text-sm text-muted">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/track/${track.trackId}`}
                            className="text-sm font-medium text-foreground transition-colors hover:text-accent truncate"
                          >
                            {track.trackName}
                          </Link>
                          {track.trackExplicitness === "explicit" && (
                            <ExplicitBadge />
                          )}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-right text-sm text-muted sm:table-cell">
                        {track.trackTimeMillis
                          ? formatDuration(track.trackTimeMillis)
                          : "--:--"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {track.previewUrl && (
                          <AudioPlayer
                            previewUrl={track.previewUrl}
                            trackId={track.trackId}
                            trackName={track.trackName}
                            artistName={track.artistName}
                            artworkUrl={track.artworkUrl100?.replace(
                              "100x100",
                              "200x200"
                            )}
                            compact
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </article>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        <p>Powered by the iTunes Search API</p>
      </footer>
    </div>
  );
}
