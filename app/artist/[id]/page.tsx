import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getArtistById, getArtistAlbums } from "@/lib/itunes";
import { getSimilarArtists } from "@/lib/lastfm";
import { getUnifiedArtist } from "@/lib/music-service";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ArtistHero from "@/app/components/ArtistHero";
import ArtistNav from "@/app/components/ArtistNav";
import TopTracksSection from "@/app/components/TopTracksSection";
import DiscographySection from "@/app/components/DiscographySection";
import ArtistDiscoveryNetwork from "@/app/components/ArtistDiscoveryNetwork";
import ArtistVideos from "@/app/components/ArtistVideos";
import ArtistBio from "@/app/components/ArtistBio";
import ArtistInsightsPanel from "@/app/components/ArtistInsightsPanel";

function SectionSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`${height} w-full rounded-2xl shimmer-wave`} aria-hidden="true" />
  );
}

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

  const [similarArtists, albums, unifiedArtist] = await Promise.all([
    getSimilarArtists(artist.artistName),
    getArtistAlbums(artistId),
    getUnifiedArtist(artist.artistName, artistId),
  ]);

  const spotifyTopTracks = unifiedArtist.spotifyTopTracks ?? [];
  const spotifyAlbums = unifiedArtist.spotifyAlbums ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="flex-1">
        {/* Cinematic Hero */}
        <ArtistHero artist={artist} unifiedArtist={unifiedArtist} />

        {/* Sticky navigation */}
        <ArtistNav />

        {/* Content sections */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Overview anchor */}
          <div id="overview" className="sr-only" aria-hidden="true" />

          {/* Main content + Sidebar layout */}
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main content */}
            <div className="flex flex-col gap-16 lg:col-span-2">
              {/* Top Tracks */}
              {spotifyTopTracks.length > 0 && (
                <Suspense fallback={<SectionSkeleton height="h-96" />}>
                  <TopTracksSection tracks={spotifyTopTracks} />
                </Suspense>
              )}

              {/* Discography */}
              {spotifyAlbums.length > 0 && (
                <Suspense fallback={<SectionSkeleton height="h-80" />}>
                  <DiscographySection albums={spotifyAlbums} />
                </Suspense>
              )}

              {/* Similar Artists Discovery */}
              {similarArtists.length > 0 && (
                <Suspense fallback={<SectionSkeleton height="h-72" />}>
                  <ArtistDiscoveryNetwork
                    similarArtists={similarArtists}
                    artistName={artist.artistName}
                  />
                </Suspense>
              )}

              {/* Videos */}
              <Suspense fallback={<SectionSkeleton height="h-80" />}>
                <ArtistVideos query={`${artist.artistName} music`} />
              </Suspense>

              {/* Biography */}
              <Suspense fallback={<SectionSkeleton height="h-48" />}>
                <ArtistBio
                  bio={unifiedArtist.bio ?? null}
                  genres={unifiedArtist.genres}
                  albums={albums}
                  artistName={artist.artistName}
                />
              </Suspense>
            </div>

            {/* Sidebar - Insights Panel */}
            <aside className="lg:col-span-1">
              <div className="sticky top-[120px]">
                <Suspense fallback={<SectionSkeleton height="h-96" />}>
                  <ArtistInsightsPanel
                    unifiedArtist={unifiedArtist}
                    albums={albums}
                  />
                </Suspense>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
