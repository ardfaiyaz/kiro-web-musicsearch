import { ItunesTrack, ItunesArtist, ItunesAlbum, SpotifyArtist } from "@/lib/types";
import TopResultCard from "./TopResultCard";
import TrackCard from "./TrackCard";
import ArtistCard from "./ArtistCard";
import AlbumCard from "./AlbumCard";
import SearchResultsSeeAll from "./SearchResultsSeeAll";

interface SearchResultsLayoutProps {
  tracks: ItunesTrack[];
  artists: ItunesArtist[];
  albums: ItunesAlbum[];
  spotifyArtist?: SpotifyArtist;
  query: string;
}

function determineTopResult(
  tracks: ItunesTrack[],
  artists: ItunesArtist[],
  albums: ItunesAlbum[],
  query: string
): { type: "track" | "artist" | "album"; track?: ItunesTrack; artist?: ItunesArtist; album?: ItunesAlbum } {
  // If query closely matches an artist name, prioritize artist
  const queryLower = query.toLowerCase();
  const matchingArtist = artists.find(
    (a) => a.artistName.toLowerCase() === queryLower
  );
  if (matchingArtist) {
    return { type: "artist", artist: matchingArtist };
  }

  // If query matches an album name closely, prioritize album
  const matchingAlbum = albums.find(
    (a) => a.collectionName.toLowerCase().includes(queryLower) ||
           queryLower.includes(a.collectionName.toLowerCase())
  );
  if (matchingAlbum) {
    return { type: "album", album: matchingAlbum };
  }

  // Default to first track as top result
  if (tracks.length > 0) {
    return { type: "track", track: tracks[0] };
  }

  if (artists.length > 0) {
    return { type: "artist", artist: artists[0] };
  }

  if (albums.length > 0) {
    return { type: "album", album: albums[0] };
  }

  return { type: "track" };
}

export default function SearchResultsLayout({
  tracks,
  artists,
  albums,
  query,
}: SearchResultsLayoutProps) {
  const topResult = determineTopResult(tracks, artists, albums, query);

  // Exclude top result from its respective list
  const displayTracks = topResult.type === "track" && topResult.track
    ? tracks.filter((t) => t.trackId !== topResult.track?.trackId).slice(0, 4)
    : tracks.slice(0, 4);

  const displayArtists = topResult.type === "artist" && topResult.artist
    ? artists.filter((a) => a.artistId !== topResult.artist?.artistId).slice(0, 6)
    : artists.slice(0, 6);

  const displayAlbums = topResult.type === "album" && topResult.album
    ? albums.filter((a) => a.collectionId !== topResult.album?.collectionId).slice(0, 4)
    : albums.slice(0, 4);

  const hasResults = tracks.length > 0 || artists.length > 0 || albums.length > 0;

  if (!hasResults) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Top Result */}
      {(topResult.track || topResult.artist || topResult.album) && (
        <section aria-label="Top result">
          <h2 className="mb-4 text-lg font-bold text-foreground sm:text-xl">
            Top Result
          </h2>
          <TopResultCard
            type={topResult.type}
            track={topResult.track}
            artist={topResult.artist}
            album={topResult.album}
          />
        </section>
      )}

      {/* Songs Section */}
      {displayTracks.length > 0 && (
        <section aria-label="Songs" className="rounded-2xl glass-light p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Songs</h2>
            {tracks.length > 4 && (
              <SearchResultsSeeAll filter="song" query={query} />
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {displayTracks.map((track) => (
              <TrackCard key={track.trackId} track={track} />
            ))}
          </div>
        </section>
      )}

      {/* Artists Section */}
      {displayArtists.length > 0 && (
        <section aria-label="Artists" className="rounded-2xl glass-light p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Artists</h2>
            {artists.length > 6 && (
              <SearchResultsSeeAll filter="artist" query={query} />
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayArtists.map((artist) => (
              <ArtistCard key={artist.artistId} artist={artist} />
            ))}
          </div>
        </section>
      )}

      {/* Albums Section */}
      {displayAlbums.length > 0 && (
        <section aria-label="Albums" className="rounded-2xl glass-light p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Albums</h2>
            {albums.length > 4 && (
              <SearchResultsSeeAll filter="album" query={query} />
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {displayAlbums.map((album) => (
              <AlbumCard key={album.collectionId} album={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
