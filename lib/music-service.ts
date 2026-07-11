import type {
  ItunesTrack,
  ItunesAlbum,
  UnifiedArtist,
  UnifiedTrack,
  UnifiedAlbum,
  UnifiedSearchResults,
} from "./types";
import { searchTracks, searchArtists, searchAlbums, getArtistById } from "./itunes";
import { getArtistInfo } from "./lastfm";
import {
  searchSpotifyArtist,
  searchSpotifyAlbum,
  getSpotifyArtistTopTracks,
  getSpotifyArtistAlbums,
} from "./spotify";
import { getLyrics } from "./lyrics";
import { searchMusicVideos } from "./youtube";

/**
 * Get a unified artist profile combining data from iTunes, Spotify, and Last.fm.
 * Uses Promise.allSettled for parallel requests with graceful fallback.
 */
export async function getUnifiedArtist(
  artistName: string,
  itunesArtistId?: number
): Promise<UnifiedArtist> {
  const [itunesResult, spotifyResult, lastfmResult] =
    await Promise.allSettled([
      itunesArtistId ? getArtistById(itunesArtistId) : Promise.resolve(null),
      searchSpotifyArtist(artistName),
      getArtistInfo(artistName),
    ]);

  const itunes =
    itunesResult.status === "fulfilled" ? itunesResult.value : null;
  const spotify =
    spotifyResult.status === "fulfilled" ? spotifyResult.value : null;
  const lastfm =
    lastfmResult.status === "fulfilled" ? lastfmResult.value : null;

  // Fetch Spotify top tracks and albums if we have a Spotify artist
  let spotifyTopTracks = null;
  let spotifyAlbums = null;
  if (spotify?.id) {
    const [topTracksResult, albumsResult] = await Promise.allSettled([
      getSpotifyArtistTopTracks(spotify.id),
      getSpotifyArtistAlbums(spotify.id),
    ]);
    spotifyTopTracks =
      topTracksResult.status === "fulfilled"
        ? topTracksResult.value
        : null;
    spotifyAlbums =
      albumsResult.status === "fulfilled" ? albumsResult.value : null;
  }

  return {
    name: artistName,
    itunes: itunes ?? undefined,
    spotify: spotify ?? undefined,
    lastfm: lastfm ?? undefined,
    spotifyTopTracks: spotifyTopTracks ?? undefined,
    spotifyAlbums: spotifyAlbums ?? undefined,
    genres: [
      ...(spotify?.genres ?? []),
      ...(lastfm?.tags?.tag?.map((t) => t.name) ?? []),
      ...(itunes?.primaryGenreName ? [itunes.primaryGenreName] : []),
    ].filter((g, i, arr) => arr.indexOf(g) === i),
    imageUrl:
      spotify?.images?.[0]?.url ??
      lastfm?.image?.find((img) => img.size === "extralarge")?.["#text"] ??
      itunes?.artworkUrl100 ??
      undefined,
    bio: lastfm?.bio?.summary ?? undefined,
    popularity: spotify?.popularity ?? undefined,
    followers: spotify?.followers ?? undefined,
  };
}

/**
 * Get a unified track with enriched data from lyrics and YouTube.
 * Uses Promise.allSettled for parallel requests with graceful fallback.
 */
export async function getUnifiedTrack(
  itunesTrack: ItunesTrack
): Promise<UnifiedTrack> {
  const query = `${itunesTrack.artistName} ${itunesTrack.trackName}`;

  const [lyricsResult, videosResult] = await Promise.allSettled([
    getLyrics(itunesTrack.artistName, itunesTrack.trackName),
    searchMusicVideos(query, 3),
  ]);

  const lyrics =
    lyricsResult.status === "fulfilled" ? lyricsResult.value : null;
  const videos =
    videosResult.status === "fulfilled" ? videosResult.value : [];

  return {
    itunes: itunesTrack,
    lyrics: lyrics ?? undefined,
    youtubeVideos: videos,
  };
}

/**
 * Get a unified album with enriched Spotify data.
 * Uses Promise.allSettled for parallel requests with graceful fallback.
 */
export async function getUnifiedAlbum(
  itunesAlbum: ItunesAlbum
): Promise<UnifiedAlbum> {
  const [spotifyResult] = await Promise.allSettled([
    searchSpotifyAlbum(itunesAlbum.collectionName, itunesAlbum.artistName),
  ]);

  const spotify =
    spotifyResult.status === "fulfilled" ? spotifyResult.value : null;

  return {
    itunes: itunesAlbum,
    spotify: spotify ?? undefined,
  };
}

/**
 * Perform a unified search across iTunes and Spotify.
 * Uses Promise.allSettled so results are returned even if one provider fails.
 */
export async function unifiedSearch(
  query: string
): Promise<UnifiedSearchResults> {
  const [
    itunesTracksResult,
    itunesArtistsResult,
    itunesAlbumsResult,
    spotifyArtistResult,
    spotifyAlbumResult,
  ] = await Promise.allSettled([
    searchTracks(query),
    searchArtists(query),
    searchAlbums(query),
    searchSpotifyArtist(query),
    searchSpotifyAlbum(query),
  ]);

  return {
    tracks:
      itunesTracksResult.status === "fulfilled"
        ? itunesTracksResult.value
        : [],
    artists:
      itunesArtistsResult.status === "fulfilled"
        ? itunesArtistsResult.value
        : [],
    albums:
      itunesAlbumsResult.status === "fulfilled"
        ? itunesAlbumsResult.value
        : [],
    spotifyArtist:
      spotifyArtistResult.status === "fulfilled"
        ? spotifyArtistResult.value ?? undefined
        : undefined,
    spotifyAlbum:
      spotifyAlbumResult.status === "fulfilled"
        ? spotifyAlbumResult.value ?? undefined
        : undefined,
  };
}
