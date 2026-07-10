export interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artistId: number;
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
  trackExplicitness?: string;
  collectionExplicitness?: string;
}

export interface ItunesArtist {
  artistId: number;
  artistName: string;
  artistLinkUrl: string;
  primaryGenreName: string;
  artistType: string;
  wrapperType: string;
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
