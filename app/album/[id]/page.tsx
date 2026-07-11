import { notFound } from "next/navigation";
import { getAlbumTracks, getArtistAlbums } from "@/lib/itunes";
import { getUnifiedAlbum } from "@/lib/music-service";
import { getSimilarArtists } from "@/lib/lastfm";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AlbumPageClient from "@/app/components/album/AlbumPageClient";
import AlbumCredits from "@/app/components/album/AlbumCredits";
import AlbumDetails from "@/app/components/album/AlbumDetails";
import SimilarAlbums from "@/app/components/album/SimilarAlbums";
import RecommendedArtists from "@/app/components/album/RecommendedArtists";
import MusicVideos from "@/app/components/album/MusicVideos";
import AIInsights from "@/app/components/album/AIInsights";
import AlbumTimeline from "@/app/components/album/AlbumTimeline";
import ExternalLinks from "@/app/components/album/ExternalLinks";

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
  const artworkUrl = album.artworkUrl100?.replace("100x100", "1000x1000") || null;

  // Fetch enrichment data in parallel with graceful degradation
  const [unifiedResult, artistAlbumsResult, similarArtistsResult] =
    await Promise.allSettled([
      getUnifiedAlbum(album),
      getArtistAlbums(album.artistId),
      getSimilarArtists(album.artistName, 8),
    ]);

  const unifiedAlbum =
    unifiedResult.status === "fulfilled" ? unifiedResult.value : null;
  const spotifyAlbum = unifiedAlbum?.spotify;

  const artistAlbums =
    artistAlbumsResult.status === "fulfilled"
      ? artistAlbumsResult.value
      : [];

  const similarArtists =
    similarArtistsResult.status === "fulfilled"
      ? similarArtistsResult.value
      : [];

  const duration = totalDuration(tracks);

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />

      <main className="flex-1">
        {/* Client-side interactive sections: Hero, Sticky Bar, Tracklist, Description */}
        <AlbumPageClient
          album={album}
          tracks={tracks}
          spotify={spotifyAlbum}
          artworkUrl={artworkUrl}
          totalDuration={duration}
        />

        {/* Server-rendered sections */}
        <AlbumCredits album={album} tracks={tracks} />

        <AlbumDetails
          album={album}
          spotify={spotifyAlbum}
          trackCount={tracks.length}
          totalDuration={duration}
        />

        {artistAlbums.length > 0 && (
          <SimilarAlbums
            albums={artistAlbums}
            currentAlbumId={album.collectionId}
          />
        )}

        <MusicVideos
          query={`${album.artistName} ${album.collectionName}`}
        />

        {similarArtists.length > 0 && (
          <RecommendedArtists artists={similarArtists} />
        )}

        <AIInsights
          albumName={album.collectionName}
          artistName={album.artistName}
          genre={album.primaryGenreName}
        />

        {artistAlbums.length > 0 && (
          <AlbumTimeline
            artistAlbums={artistAlbums}
            currentAlbumId={album.collectionId}
          />
        )}

        <ExternalLinks album={album} spotify={spotifyAlbum} />
      </main>

      <Footer />
    </div>
  );
}
