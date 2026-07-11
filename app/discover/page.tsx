import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import HorizontalScroll from "@/app/components/HorizontalScroll";
import GenreCard from "@/app/components/GenreCard";
import DiscoveryMoodSelector from "@/app/components/DiscoveryMoodSelector";
import RecommendationPanel from "@/app/components/RecommendationPanel";
import {
  getTrendingSongs,
  getNewReleases,
  getTopAlbums,
  GENRES,
} from "@/lib/discovery";
import { getRecommendationsByMood, RecommendedTrack } from "@/lib/ai-discovery";
import { getSimilarArtists } from "@/lib/lastfm";

const EDITOR_PICKS = [
  {
    id: "best-of-2024",
    title: "Best of 2024",
    subtitle: "The defining tracks of the year",
    query: "Best of 2024",
    gradient: "from-violet-500 to-purple-700",
  },
  {
    id: "indie-essentials",
    title: "Indie Essentials",
    subtitle: "Underground gems and indie favorites",
    query: "Indie Essentials",
    gradient: "from-emerald-500 to-teal-700",
  },
  {
    id: "late-night-vibes",
    title: "Late Night Vibes",
    subtitle: "Smooth sounds for after hours",
    query: "Late Night Vibes",
    gradient: "from-blue-500 to-indigo-700",
  },
  {
    id: "feel-good-classics",
    title: "Feel Good Classics",
    subtitle: "Timeless tracks to lift your mood",
    query: "Feel Good Classics",
    gradient: "from-orange-500 to-red-700",
  },
];

export default async function DiscoverPage() {
  const [trendingSongs, newReleases, topAlbums, moodRecs] = await Promise.all([
    getTrendingSongs(),
    getNewReleases(),
    getTopAlbums(),
    getRecommendationsByMood("chill"),
  ]);

  // Enrich recommendations with Last.fm similar artist data
  let recommendedTracks: RecommendedTrack[] = moodRecs.tracks;
  if (recommendedTracks.length > 0) {
    const topArtist = recommendedTracks[0]?.artistName;
    if (topArtist) {
      const similarArtists = await getSimilarArtists(topArtist, 5);
      if (similarArtists.length > 0) {
        // Add "Similar to" reason for tracks from related artists
        recommendedTracks = recommendedTracks.map((track) => {
          const isSimilar = similarArtists.some(
            (sa) => sa.name.toLowerCase() === track.artistName.toLowerCase()
          );
          if (isSimilar) {
            return {
              ...track,
              reason: `Similar to ${topArtist}`,
            };
          }
          return track;
        });
      }
    }
  }

  const heroSong = trendingSongs[0];

  // Extract unique trending artists from trending songs
  const trendingArtists = Array.from(
    new Map(
      trendingSongs.map((song) => [song.artistName, song])
    ).values()
  ).slice(0, 12);

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        {heroSong && (
          <section
            className="relative overflow-hidden bg-card"
            aria-label="Featured track"
          >
            <div className="absolute inset-0 opacity-30">
              {heroSong.artworkUrl100 && (
                <Image
                  src={heroSong.artworkUrl100.replace("100x100", "600x600")}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover blur-3xl scale-110"
                  aria-hidden="true"
                />
              )}
            </div>
            <Link
              href={`/track/${heroSong.id}`}
              className="group relative block mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
            >
              <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-end sm:gap-12">
                <div className="relative aspect-square w-48 shrink-0 overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] sm:w-56 lg:w-64">
                  {heroSong.artworkUrl100 && (
                    <Image
                      src={heroSong.artworkUrl100.replace("100x100", "600x600")}
                      alt={`${heroSong.name} artwork`}
                      fill
                      sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, 256px"
                      className="object-cover"
                      priority
                    />
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">
                    Trending Now
                  </p>
                  <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                    {heroSong.name}
                  </h2>
                  <p className="mt-2 text-lg text-muted">
                    {heroSong.artistName}
                  </p>
                </div>
              </div>
            </Link>
          </section>
        )}

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Editor Picks */}
          <section aria-label="Editor picks" className="mb-16">
            <h3 className="mb-6 text-2xl font-bold text-foreground">
              Editor Picks
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EDITOR_PICKS.map((pick) => (
                <Link
                  key={pick.id}
                  href={`/?q=${encodeURIComponent(pick.query)}`}
                  className="group relative overflow-hidden rounded-2xl glass-card p-6 transition-premium hover:border-foreground/10 hover:shadow-xl hover:-translate-y-1"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${pick.gradient} opacity-15 transition-opacity group-hover:opacity-25`}
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <h4 className="text-base font-bold text-foreground">
                      {pick.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-muted">
                      {pick.subtitle}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors group-hover:text-foreground">
                      Explore
                      <svg
                        className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Recommended for You */}
          {recommendedTracks.length > 0 && (
            <section aria-label="Recommended for you" className="mb-16">
              <RecommendationPanel
                title="Recommended for You"
                tracks={recommendedTracks}
              />
            </section>
          )}

          {/* Trending Songs */}
          {trendingSongs.length > 0 && (
            <section aria-label="Trending songs" className="mb-16">
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Trending Songs
              </h3>
              <HorizontalScroll>
                {trendingSongs.map((song) => (
                  <Link
                    key={song.id}
                    href={`/track/${song.id}`}
                    className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:-translate-y-1 sm:w-52"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-border">
                      {song.artworkUrl100 && (
                        <Image
                          src={song.artworkUrl100.replace("100x100", "300x300")}
                          alt={`${song.name} artwork`}
                          fill
                          sizes="(max-width: 640px) 176px, 208px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 p-4">
                      <h4 className="truncate text-sm font-semibold text-foreground">
                        {song.name}
                      </h4>
                      <p className="truncate text-xs text-muted">
                        {song.artistName}
                      </p>
                    </div>
                  </Link>
                ))}
              </HorizontalScroll>
            </section>
          )}

          {/* Trending Artists */}
          {trendingArtists.length > 0 && (
            <section aria-label="Trending artists" className="mb-16">
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Trending Artists
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {trendingArtists.map((song) => (
                  <Link
                    key={song.artistName}
                    href={`/?q=${encodeURIComponent(song.artistName)}`}
                    className="group flex flex-col items-center gap-4 rounded-2xl glass-card p-5 transition-premium hover:border-foreground/10 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-full bg-border shadow-md sm:h-24 sm:w-24">
                      {song.artworkUrl100 && (
                        <Image
                          src={song.artworkUrl100.replace("100x100", "200x200")}
                          alt={song.artistName}
                          fill
                          sizes="96px"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      )}
                    </div>
                    <span className="truncate text-center text-xs font-medium text-foreground sm:text-sm">
                      {song.artistName}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Discover by Mood */}
          <section aria-label="Discover by mood" className="mb-16">
            <h3 className="mb-6 text-2xl font-bold text-foreground">
              Discover by Mood
            </h3>
            <DiscoveryMoodSelector />
          </section>

          {/* New Releases */}
          {newReleases.length > 0 && (
            <section aria-label="New releases" className="mb-16">
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                New Releases
              </h3>
              <HorizontalScroll>
                {newReleases.map((album) => (
                  <Link
                    key={album.id}
                    href={`/album/${album.id}`}
                    className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:-translate-y-1 sm:w-52"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-border">
                      {album.artworkUrl100 && (
                        <Image
                          src={album.artworkUrl100.replace("100x100", "300x300")}
                          alt={`${album.name} artwork`}
                          fill
                          sizes="(max-width: 640px) 176px, 208px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 p-4">
                      <h4 className="truncate text-sm font-semibold text-foreground">
                        {album.name}
                      </h4>
                      <p className="truncate text-xs text-muted">
                        {album.artistName}
                      </p>
                    </div>
                  </Link>
                ))}
              </HorizontalScroll>
            </section>
          )}

          {/* Featured Albums */}
          {topAlbums.length > 0 && (
            <section aria-label="Featured albums" className="mb-16">
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Featured Albums
              </h3>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {topAlbums.slice(0, 10).map((album) => (
                  <Link
                    key={album.id}
                    href={`/album/${album.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-border">
                      {album.artworkUrl100 && (
                        <Image
                          src={album.artworkUrl100.replace("100x100", "300x300")}
                          alt={`${album.name} artwork`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 p-4">
                      <h4 className="truncate text-sm font-semibold text-foreground">
                        {album.name}
                      </h4>
                      <p className="truncate text-xs text-muted">
                        {album.artistName}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Browse by Genre */}
          <section aria-label="Browse by genre" className="mb-16">
            <h3 className="mb-6 text-2xl font-bold text-foreground">
              Browse by Genre
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {GENRES.map((genre) => (
                <GenreCard
                  key={genre.id}
                  name={genre.name}
                  gradient={genre.gradient}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
