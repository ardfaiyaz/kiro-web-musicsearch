import { notFound } from "next/navigation";
import Image from "next/image";
import { getArtistById, getArtistTracks, getArtistAlbums } from "@/lib/itunes";
import { getArtistInfo, getSimilarArtists } from "@/lib/lastfm";
import { getSimilarTracks } from "@/lib/ai-discovery";
import { getUnifiedArtist } from "@/lib/music-service";
import TrackGrid from "@/app/components/TrackGrid";
import AlbumCard from "@/app/components/AlbumCard";
import SimilarArtists from "@/app/components/SimilarArtists";
import RecommendationPanel from "@/app/components/RecommendationPanel";
import MusicInsights from "@/app/components/MusicInsights";
import VideoSection from "@/app/components/VideoSection";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
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

  const [lastFmInfo, similarArtists, artistTracks, albums, unifiedArtist] = await Promise.all([
    getArtistInfo(artist.artistName),
    getSimilarArtists(artist.artistName),
    getArtistTracks(artistId, -1),
    getArtistAlbums(artistId),
    getUnifiedArtist(artist.artistName, artistId),
  ]);

  // Get a representative track for "artists like X" recommendations
  const representativeTrack = artistTracks.tracks[0] || null;
  const artistRecommendations = representativeTrack
    ? await getSimilarTracks(representativeTrack)
    : { tracks: [], error: true };

  const bio = lastFmInfo?.bio?.summary
    ? lastFmInfo.bio.summary.replace(/<a\b[^>]*>.*?<\/a>/gi, "").trim()
    : null;

  // Use Spotify image (higher quality) if available, otherwise Last.fm
  const artistImage = unifiedArtist.imageUrl || "";
  const spotifyData = unifiedArtist.spotify;
  const unifiedGenres = unifiedArtist.genres;

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />

      <main className="flex-1">
        {/* Hero Banner */}
        <section
          className="relative overflow-hidden bg-card"
          aria-label="Artist hero"
        >
          {/* Background blur from artist image */}
          {artistImage && (
            <div className="absolute inset-0 opacity-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artistImage}
                alt=""
                className="h-full w-full object-cover blur-3xl scale-125"
                aria-hidden="true"
              />
            </div>
          )}
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
            <div className="flex flex-col items-center gap-8 text-center">
              {/* Large circular portrait */}
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border-2 border-border/50 shadow-2xl sm:h-52 sm:w-52 lg:h-60 lg:w-60">
                {artistImage ? (
                  <Image
                    src={artistImage}
                    alt={`${artist.artistName} photo`}
                    fill
                    sizes="(max-width: 640px) 160px, (max-width: 1024px) 208px, 240px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-foreground/5">
                    <svg
                      className="h-20 w-20 text-muted sm:h-24 sm:w-24"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Artist name and genre */}
              <div className="flex flex-col gap-3">
                <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {artist.artistName}
                </h2>
                <p className="text-lg text-muted">
                  {artist.primaryGenreName || "Music"}
                </p>
              </div>

              {/* Stats */}
              {(lastFmInfo?.stats || spotifyData) && (
                <div className="flex flex-wrap justify-center gap-8">
                  {spotifyData && (
                    <>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-foreground sm:text-3xl">
                          {spotifyData.followers.toLocaleString()}
                        </span>
                        <span className="text-xs uppercase tracking-wider text-muted">
                          Followers
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-foreground sm:text-3xl">
                          {spotifyData.popularity}
                        </span>
                        <span className="text-xs uppercase tracking-wider text-muted">
                          Popularity
                        </span>
                      </div>
                    </>
                  )}
                  {lastFmInfo?.stats && (
                    <>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-foreground sm:text-3xl">
                          {parseInt(lastFmInfo.stats.listeners).toLocaleString()}
                        </span>
                        <span className="text-xs uppercase tracking-wider text-muted">
                          Listeners
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-foreground sm:text-3xl">
                          {parseInt(lastFmInfo.stats.playcount).toLocaleString()}
                        </span>
                        <span className="text-xs uppercase tracking-wider text-muted">
                          Total Plays
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Genres */}
              {unifiedGenres.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {unifiedGenres.slice(0, 8).map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <ArtistActions artist={artist} />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Artist Insights */}
          <section className="mb-16" aria-label="Artist insights">
            <MusicInsights
              type="artist"
              artistName={artist.artistName}
              genre={artist.primaryGenreName || "Music"}
              lastFmInfo={lastFmInfo}
              albums={albums}
            />
          </section>

          {/* Biography */}
          <section className="mb-16" aria-label="Biography">
            <h2 className="mb-6 text-2xl font-bold text-foreground">About</h2>
            {bio ? (
              <p className="max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
                {bio}
              </p>
            ) : (
              <p className="text-base text-muted italic">
                Biography unavailable
              </p>
            )}
          </section>

          {/* Top Songs */}
          {artistTracks.tracks.length > 0 && (
            <section className="mb-16" aria-label="Top songs">
              <h2 className="mb-8 text-2xl font-bold text-foreground">
                Top Songs
              </h2>
              <TrackGrid tracks={artistTracks.tracks} />
            </section>
          )}

          {/* Albums */}
          {albums.length > 0 && (
            <section className="mb-16" aria-label="Albums">
              <h2 className="mb-8 text-2xl font-bold text-foreground">
                Discography
              </h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {albums.map((album) => (
                  <AlbumCard key={album.collectionId} album={album} />
                ))}
              </div>
            </section>
          )}

          {/* Similar Artists */}
          {similarArtists.length > 0 && (
            <section className="mb-16">
              <SimilarArtists artists={similarArtists} />
            </section>
          )}

          {/* Music Videos */}
          <VideoSection query={`${artist.artistName} music`} />

          {/* Enhanced Recommendations */}
          {!artistRecommendations.error && artistRecommendations.tracks.length > 0 && (
            <section className="mb-16" aria-label="Recommended tracks">
              <RecommendationPanel
                title={`Artists Like ${artist.artistName}`}
                tracks={artistRecommendations.tracks}
              />
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
