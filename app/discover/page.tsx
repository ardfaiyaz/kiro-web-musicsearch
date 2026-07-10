import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import HorizontalScroll from "@/app/components/HorizontalScroll";
import GenreCard from "@/app/components/GenreCard";
import {
  getTrendingSongs,
  getNewReleases,
  getTopAlbums,
  GENRES,
} from "@/lib/discovery";

export default async function DiscoverPage() {
  const [trendingSongs, newReleases, topAlbums] = await Promise.all([
    getTrendingSongs(),
    getNewReleases(),
    getTopAlbums(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <section aria-label="Page heading" className="mb-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Discover Music
          </h2>
          <p className="mt-2 text-muted">
            Explore trending songs, new releases, and browse by genre
          </p>
        </section>

        {/* Trending Songs */}
        {trendingSongs.length > 0 && (
          <section aria-label="Trending songs" className="mb-10">
            <h3 className="mb-4 text-xl font-bold text-foreground">
              Trending Songs
            </h3>
            <HorizontalScroll>
              {trendingSongs.map((song) => (
                <article
                  key={song.id}
                  className="flex w-40 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:-translate-y-1 sm:w-48"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-border">
                    {song.artworkUrl100 && (
                      <Image
                        src={song.artworkUrl100.replace("100x100", "200x200")}
                        alt={`${song.name} artwork`}
                        fill
                        sizes="(max-width: 640px) 160px, 192px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <h4 className="truncate text-sm font-semibold text-foreground">
                      {song.name}
                    </h4>
                    <p className="truncate text-xs text-muted">
                      {song.artistName}
                    </p>
                  </div>
                </article>
              ))}
            </HorizontalScroll>
          </section>
        )}

        {/* New Releases */}
        {newReleases.length > 0 && (
          <section aria-label="New releases" className="mb-10">
            <h3 className="mb-4 text-xl font-bold text-foreground">
              New Releases
            </h3>
            <HorizontalScroll>
              {newReleases.map((album) => (
                <article
                  key={album.id}
                  className="flex w-40 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:-translate-y-1 sm:w-48"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-border">
                    {album.artworkUrl100 && (
                      <Image
                        src={album.artworkUrl100.replace("100x100", "200x200")}
                        alt={`${album.name} artwork`}
                        fill
                        sizes="(max-width: 640px) 160px, 192px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <h4 className="truncate text-sm font-semibold text-foreground">
                      {album.name}
                    </h4>
                    <p className="truncate text-xs text-muted">
                      {album.artistName}
                    </p>
                  </div>
                </article>
              ))}
            </HorizontalScroll>
          </section>
        )}

        {/* Featured Albums */}
        {topAlbums.length > 0 && (
          <section aria-label="Featured albums" className="mb-10">
            <h3 className="mb-4 text-xl font-bold text-foreground">
              Featured Albums
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {topAlbums.slice(0, 10).map((album) => (
                <article
                  key={album.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-border">
                    {album.artworkUrl100 && (
                      <Image
                        src={album.artworkUrl100.replace("100x100", "200x200")}
                        alt={`${album.name} artwork`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <h4 className="truncate text-sm font-semibold text-foreground">
                      {album.name}
                    </h4>
                    <p className="truncate text-xs text-muted">
                      {album.artistName}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Popular Artists (derived from trending songs) */}
        {trendingSongs.length > 0 && (
          <section aria-label="Popular artists" className="mb-10">
            <h3 className="mb-4 text-xl font-bold text-foreground">
              Popular Artists
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {Array.from(
                new Map(
                  trendingSongs.map((song) => [song.artistName, song])
                ).values()
              )
                .slice(0, 12)
                .map((song) => (
                  <Link
                    key={song.artistName}
                    href={`/?q=${encodeURIComponent(song.artistName)}`}
                    className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-accent/10 sm:h-20 sm:w-20">
                      {song.artworkUrl100 && (
                        <Image
                          src={song.artworkUrl100.replace("100x100", "200x200")}
                          alt={song.artistName}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="truncate text-center text-xs font-medium text-foreground transition-colors group-hover:text-accent sm:text-sm">
                      {song.artistName}
                    </span>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* Browse by Genre */}
        <section aria-label="Browse by genre" className="mb-10">
          <h3 className="mb-4 text-xl font-bold text-foreground">
            Browse by Genre
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {GENRES.map((genre) => (
              <GenreCard
                key={genre.id}
                name={genre.name}
                gradient={genre.gradient}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        <p>Powered by the iTunes Search API</p>
      </footer>
    </div>
  );
}
