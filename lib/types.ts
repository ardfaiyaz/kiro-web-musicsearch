export interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artistId: number;
  collectionId?: number;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string | null;
  primaryGenreName: string;
  releaseDate: string;
  trackTimeMillis: number;
  trackViewUrl: string;
  collectionViewUrl: string;
  kind: string;
  wrapperType: string;
  trackNumber?: number;
  trackExplicitness?: string;
  collectionExplicitness?: string;
  discNumber?: number;
  discCount?: number;
}

export interface ItunesArtist {
  artistId: number;
  artistName: string;
  artistLinkUrl: string;
  primaryGenreName: string;
  artistType: string;
  wrapperType: string;
  artworkUrl100?: string;
}

export interface ItunesAlbum {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artistId: number;
  artworkUrl100: string;
  collectionViewUrl: string;
  primaryGenreName: string;
  releaseDate: string;
  trackCount: number;
  wrapperType: string;
  collectionType: string;
  collectionExplicitness?: string;
}

export type ItunesResult = ItunesTrack | ItunesArtist | ItunesAlbum;

export interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesResult[];
}

export interface RecentSearch {
  query: string;
  timestamp: number;
  imageUrl?: string;
}

// Last.fm types
export interface LastFmArtist {
  name: string;
  mbid?: string;
  url: string;
  image: { "#text": string; size: string }[];
  bio?: {
    summary: string;
    content: string;
  };
  tags?: {
    tag: { name: string; url: string }[];
  };
  stats?: {
    listeners: string;
    playcount: string;
  };
  similar?: {
    artist: LastFmSimilarArtist[];
  };
}

export interface LastFmSimilarArtist {
  name: string;
  url: string;
  image: { "#text": string; size: string }[];
  match?: string;
}

export interface LastFmAlbum {
  name: string;
  artist: string;
  url: string;
  image: { "#text": string; size: string }[];
  listeners?: string;
  playcount?: string;
}

// Extended iTunes types for album detail
export interface AlbumDetail {
  album: ItunesAlbum;
  tracks: ItunesTrack[];
}

// Spotify types
export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: number;
  images: { url: string; width: number; height: number }[];
  spotifyUrl: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artistName: string;
  images: { url: string; width: number; height: number }[];
  releaseDate: string;
  totalTracks: number;
  albumType: string;
  spotifyUrl: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  albumImages: { url: string; width: number; height: number }[];
  durationMs: number;
  popularity: number;
  previewUrl: string | null;
  explicit: boolean;
  trackNumber: number;
  spotifyUrl: string;
}

// YouTube types
export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
}

// Unified types combining multiple providers
export interface UnifiedArtist {
  name: string;
  itunes?: ItunesArtist;
  spotify?: SpotifyArtist;
  lastfm?: LastFmArtist;
  spotifyTopTracks?: SpotifyTrack[];
  spotifyAlbums?: SpotifyAlbum[];
  genres: string[];
  imageUrl?: string;
  bio?: string;
  popularity?: number;
  followers?: number;
}

export interface UnifiedTrack {
  itunes: ItunesTrack;
  lyrics?: string;
  youtubeVideos: YouTubeVideo[];
}

export interface UnifiedAlbum {
  itunes: ItunesAlbum;
  spotify?: SpotifyAlbum;
}

export interface UnifiedSearchResults {
  tracks: ItunesTrack[];
  artists: ItunesArtist[];
  albums: ItunesAlbum[];
  spotifyArtist?: SpotifyArtist;
  spotifyAlbum?: SpotifyAlbum;
}
