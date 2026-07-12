import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTrackById, getArtistTracks } from "@/lib/itunes";
import { getRecommendations } from "@/lib/recommendations";
import { getSimilarTracks } from "@/lib/ai-discovery";
import AudioPlayer from "@/app/components/AudioPlayer";
import TrackGrid from "@/app/components/TrackGrid";
import RecommendationPanel from "@/app/components/RecommendationPanel";
import MusicInsights from "@/app/components/MusicInsights";
import LyricsDisplay from "@/app/components/LyricsDisplay";
import VideoSection from "@/app/components/VideoSection";
import ExplicitBadge from "@/app/components/ExplicitBadge";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ShareMenu from "@/app/components/ShareMenu";
import BPMIndicator from "@/app/components/BPMIndicator";
import LinerNotes from "@/app/components/album/LinerNotes";
import ArtistRadio from "@/app/components/player/ArtistRadio";
import WaveformVisualizer from "@/app/components/player/WaveformVisualizer";
import DynamicColorTheme from "@/app/components/DynamicColorTheme";
import TrackOrganization from "@/app/components/TrackOrganization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const trackId = parseInt(id, 10);

  if (isNaN(trackId)) {
    return { title: "Track Not Found" };
  }

  const track = await getTrackById(trackId);

  if (!track) {
    return { title: "Track Not Found" };
  }

  const title = `${track.trackName} by ${track.artistName} - Music Search & Discovery`;
  const description = `Listen to ${track.trackName} by ${track.artistName} from the album ${track.collectionName}. Genre: ${track.primaryGenreName}.`;
  const artworkUrl = track.artworkUrl100?.replace("100x100", "600x600");

  return {
    title,
    description,
    openGraph: {
      title: `${track.trackName} by ${track.artistName}`,
      description,
      ...(artworkUrl
        ? {
            images: [
              {
                url: artworkUrl,
                width: 600,
                height: 600,
                alt: `${track.trackName} artwork`,
              },
            ],
          }
        : {}),
    },
  };
}

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
  const aiRecommendations = await getRecommendations(track);
  const similarTracksResult = await getSimilarTracks(track);
  const artworkUrl = track.artworkUrl100?.replace("100x100", "600x600");

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />

      <div className="flex-1">
        {/* Cinematic hero with artwork blur */}
        <DynamicColorTheme imageUrl={artworkUrl} intensity="strong" className="overflow-hidden bg-card">
          <section className="relative" aria-label="Track hero">
            {artworkUrl && (
              <div className="absolute inset-0 opacity-20">
                <Image
                  src={artworkUrl}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover blur-3xl scale-110"
                  aria-hidden="true"
                />
              </div>
            )}
            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
              <article className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                {/* Artwork */}
                <div className="shrink-0">
                  <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl lg:w-80">
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
                      <div className="flex h-full w-full items-center justify-center bg-foreground/5">
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
                            strokeWidth={1}
                            d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Waveform below artwork */}
                  <div className="mt-4 flex justify-center">
                    <WaveformVisualizer barCount={24} className="h-12" />
                  </div>
                </div>

                {/* Details */}
                <section className="flex flex-1 flex-col gap-6" aria-label="Track details">
                  <header>
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {track.trackName}
                      </h2>
                      {track.trackExplicitness === "explicit" && <ExplicitBadge />}
                    </div>
                    <p className="mt-2 text-lg text-muted">
                      <Link
                        href={`/artist/${track.artistId}`}
                        className="transition-colors hover:text-foreground"
                      >
                        {track.artistName}
                      </Link>
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <BPMIndicator
                        genre={track.primaryGenreName}
                        durationMs={track.trackTimeMillis}
                      />
                    </div>
                  </header>

                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                        Album
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {track.collectionId ? (
                          <Link
                            href={`/album/${track.collectionId}`}
                            className="transition-colors hover:text-muted"
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
                      <dd className="text-sm font-medium text-foreground">
                        {track.primaryGenreName}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                        Release Date
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {formatDate(track.releaseDate)}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                        Duration
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
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
                      track={track}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <ShareMenu
                      type="track"
                      trackName={track.trackName}
                      artistName={track.artistName}
                      albumName={track.collectionName}
                      artworkUrl={track.artworkUrl100}
                    />
                    <ArtistRadio
                      artistId={track.artistId}
                      artistName={track.artistName}
                    />
                  </div>
                </section>
              </article>
            </div>
          </section>
        </DynamicColorTheme>

        {/* Recommendations */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Rating, Tags, and Journal */}
          <div className="mb-12">
            <TrackOrganization trackId={track.trackId} />
          </div>

          {/* Insights and Lyrics sidebar */}
          <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <MusicInsights type="track" track={track} />
            </div>
            <div className="lg:col-span-2">
              <LyricsDisplay trackName={track.trackName} artistName={track.artistName} />
            </div>
          </div>

          {/* Music Videos */}
          <VideoSection query={`${track.artistName} ${track.trackName}`} />

          {/* Liner Notes */}
          <div className="mb-12">
            <LinerNotes track={track} artworkUrl={artworkUrl || undefined} />
          </div>

          {recommendationsResult.error ? (
            <section className="mb-12" aria-label="Recommendations unavailable">
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                More from {track.artistName}
              </h2>
              <p className="text-sm text-muted">
                Unable to load recommendations at this time. Please try again later.
              </p>
            </section>
          ) : (
            recommendationsResult.tracks.length > 0 && (
              <section className="mb-12" aria-label="More from this artist">
                <h2 className="mb-8 text-2xl font-bold text-foreground">
                  More from {track.artistName}
                </h2>
                <TrackGrid tracks={recommendationsResult.tracks} />
              </section>
            )
          )}

          {aiRecommendations.error ? (
            <section className="mb-12" aria-label="Recommendations error">
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                You Might Also Like
              </h2>
              <p className="text-sm text-muted">
                Unable to load recommendations at this time. Please try again later.
              </p>
            </section>
          ) : (
            aiRecommendations.tracks.length > 0 && (
              <section className="mb-12" aria-label="Recommended tracks">
                <h2 className="mb-8 text-2xl font-bold text-foreground">
                  You Might Also Like
                </h2>
                <TrackGrid tracks={aiRecommendations.tracks} />
              </section>
            )
          )}

          {/* Enhanced recommendations with reasons */}
          {!similarTracksResult.error && similarTracksResult.tracks.length > 0 && (
            <div className="mb-12">
              <RecommendationPanel
                title="Similar Tracks"
                tracks={similarTracksResult.tracks}
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
