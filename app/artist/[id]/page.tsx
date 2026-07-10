import { notFound } from "next/navigation";
import { getArtistById, getArtistTracks, getArtistAlbums } from "@/lib/itunes";
import { getArtistInfo, getSimilarArtists } from "@/lib/lastfm";
import TrackGrid from "@/app/components/TrackGrid";
import AlbumCard from "@/app/components/AlbumCard";
import SimilarArtists from "@/app/components/SimilarArtists";
import Header from "@/app/components/Header";
import ArtistActions from "@/app/components/ArtistActions";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artistId = parseInt(id, 10);

  if (isNaN(artistId)) {
    notFound();
  }

  const artist = await getArtistById(artistId);

  if (!artist) {
    notFound();
  }

  const [lastFmInfo, similarArtists, artistTracks, albums] = await Promise.all([
    getArtistInfo(artist.artistName),
    getSimilarArtists(artist.artistName),
    getArtistTracks(artistId, -1),
    getArtistAlbums(artistId),
  ]);

  const bio = lastFmInfo?.bio?.summary
    ? lastFmInfo.bio.summary.replace(/<a\b[^>]*>.*?<\/a>/gi, "").trim()
    : null;

  const tags = lastFmInfo?.tags?.tag || [];

  const artistImage =
    lastFmInfo?.image?.find((img) => img.size === "extralarge")?.["#text"] ||
    lastFmInfo?.image?.find((img) => img.size === "large")?.["#text"] ||
    "";

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <article>
          {/* Artist Header */}
          <header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full bg-border shadow-lg sm:h-48 sm:w-48">
              {artistImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artistImage}
                  alt={`${artist.artistName} photo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent/10">
                  <svg
                    className="h-20 w-20 text-accent"
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
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                {artist.artistName}
              </h2>
              <p className="text-lg text-muted">
                {artist.primaryGenreName || "Music"}
              </p>
              {lastFmInfo?.stats && (
                <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
                  <span className="text-sm text-muted">
                    <strong className="text-foreground">
                      {parseInt(lastFmInfo.stats.listeners).toLocaleString()}
                    </strong>{" "}
                    listeners
                  </span>
                  <span className="text-sm text-muted">
                    <strong className="text-foreground">
                      {parseInt(lastFmInfo.stats.playcount).toLocaleString()}
                    </strong>{" "}
                    plays
                  </span>
                </div>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  {tags.slice(0, 6).map((tag) => (
                    <span
                      key={tag.name}
                      className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <ArtistActions artist={artist} />
            </div>
          </header>

          {/* Biography */}
          <section className="mt-10" aria-label="Biography">
            <h2 className="mb-4 text-xl font-bold text-foreground">About</h2>
            {bio ? (
              <p className="max-w-3xl leading-relaxed text-muted">{bio}</p>
            ) : (
              <p className="text-sm text-muted italic">
                Biography unavailable
              </p>
            )}
          </section>

          {/* Top Songs */}
          {artistTracks.tracks.length > 0 && (
            <section className="mt-10" aria-label="Top songs">
              <h2 className="mb-6 text-xl font-bold text-foreground">
                Top Songs
              </h2>
              <TrackGrid tracks={artistTracks.tracks} />
            </section>
          )}

          {/* Albums */}
          {albums.length > 0 && (
            <section className="mt-10" aria-label="Albums">
              <h2 className="mb-6 text-xl font-bold text-foreground">Albums</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {albums.map((album) => (
                  <AlbumCard key={album.collectionId} album={album} />
                ))}
              </div>
            </section>
          )}

          {/* Similar Artists */}
          {similarArtists.length > 0 && (
            <section className="mt-10">
              <SimilarArtists artists={similarArtists} />
            </section>
          )}
        </article>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        <p>Powered by the iTunes Search API & Last.fm</p>
      </footer>
    </div>
  );
}
