import { ItunesSearchResponse, ItunesTrack } from "./types";

export async function searchTracks(query: string): Promise<ItunesTrack[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodedQuery}&media=music&limit=25`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ItunesSearchResponse = await response.json();
    return data.results.filter((item) => item.wrapperType === "track");
  } catch (error) {
    console.error("Failed to search tracks:", error);
    throw new Error("Failed to search for music. Please try again.");
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
      (item) => item.wrapperType === "track"
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
        (item) =>
          item.wrapperType === "track" && item.trackId !== excludeTrackId
      )
      .slice(0, 10);
    return { tracks, error: false };
  } catch (error) {
    console.error("Failed to get artist tracks:", error);
    return { tracks: [], error: true };
  }
}
