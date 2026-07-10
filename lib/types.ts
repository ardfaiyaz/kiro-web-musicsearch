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
