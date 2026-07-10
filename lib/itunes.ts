import {
  ItunesSearchResponse,
  ItunesTrack,
  ItunesArtist,
  ItunesAlbum,
} from "./types";

export async function searchTracks(
  query: string,
  entity?: string
): Promise<ItunesTrack[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    let url = `https://itunes.apple.com/search?term=${encodedQuery}&media=music&limit=25&entity=musicTrack`;

    if (entity === "song") {
      url += "&attribute=songTerm";
    }

    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ItunesSearchResponse = await response.json();

    return data.results.filter(
      (item): item is ItunesTrack => item.wrapperType === "track"
    );
  } catch (error) {
    console.error("Failed to search tracks:", error);
    throw new Error("Failed to search for music. Please try again.");
  }
}

export async function searchArtists(
  query: string
): Promise<ItunesArtist[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://itunes.apple.com/search?term=${encodedQuery}&entity=musicArtist&limit=25`;

    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ItunesSearchResponse = await response.json();

    return data.results.filter(
      (item): item is ItunesArtist => item.wrapperType === "artist"
    );
  } catch (error) {
    console.error("Failed to search artists:", error);
    throw new Error("Failed to search for artists. Please try again.");
  }
}

export async function searchAlbums(
  query: string
): Promise<ItunesAlbum[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://itunes.apple.com/search?term=${encodedQuery}&entity=album&limit=25`;

    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ItunesSearchResponse = await response.json();

    return data.results.filter(
      (item): item is ItunesAlbum => item.wrapperType === "collection"
    );
  } catch (error) {
    console.error("Failed to search albums:", error);
    throw new Error("Failed to search for albums. Please try again.");
  }
}

export async function getTrackById(
  trackId: number
): Promise<ItunesTrack | null> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${trackId}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ItunesSearchResponse = await response.json();
    const track = data.results.find(
      (item): item is ItunesTrack => item.wrapperType === "track"
    );
    return track || null;
  } catch (error) {
    console.error("Failed to get track:", error);
    throw new Error("Failed to load track details. Please try again.");
  }
}

export interface ArtistTracksResult {
  tracks: ItunesTrack[];
  error: boolean;
}

export async function getArtistTracks(
  artistId: number,
  excludeTrackId: number
): Promise<ArtistTracksResult> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${artistId}&entity=song&limit=11`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ItunesSearchResponse = await response.json();
    const tracks = data.results
      .filter(
        (item): item is ItunesTrack =>
          item.wrapperType === "track" &&
          (item as ItunesTrack).trackId !== excludeTrackId
      )
      .slice(0, 10);
    return { tracks, error: false };
  } catch (error) {
    console.error("Failed to get artist tracks:", error);
    return { tracks: [], error: true };
  }
}
