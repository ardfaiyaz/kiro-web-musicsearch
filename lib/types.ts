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
}

export interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesTrack[];
}
