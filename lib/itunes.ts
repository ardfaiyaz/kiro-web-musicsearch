import {
  ItunesSearchResponse,
  ItunesTrack,
  ItunesArtist,
  ItunesAlbum,
  AlbumDetail,
} from "./types";
import { ApiResult, classifyError } from "./api-error";

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

export async function getArtistById(
  artistId: number
): Promise<ItunesArtist | null> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${artistId}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ItunesSearchResponse = await response.json();
    const artist = data.results.find(
      (item): item is ItunesArtist => item.wrapperType === "artist"
    );
    return artist || null;
  } catch (error) {
    console.error("Failed to get artist:", error);
    return null;
  }
}

export async function getAlbumById(
  collectionId: number
): Promise<ItunesAlbum | null> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${collectionId}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ItunesSearchResponse = await response.json();
    const album = data.results.find(
      (item): item is ItunesAlbum => item.wrapperType === "collection"
    );
    return album || null;
  } catch (error) {
    console.error("Failed to get album:", error);
    return null;
  }
}

export async function getAlbumTracks(
  collectionId: number
): Promise<AlbumDetail | null> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${collectionId}&entity=song`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ItunesSearchResponse = await response.json();

    const album = data.results.find(
      (item): item is ItunesAlbum => item.wrapperType === "collection"
    );

    if (!album) {
      return null;
    }

    const tracks = data.results.filter(
      (item): item is ItunesTrack => item.wrapperType === "track"
    );

    return { album, tracks };
  } catch (error) {
    console.error("Failed to get album tracks:", error);
    return null;
  }
}

export async function getArtistAlbums(
  artistId: number
): Promise<ItunesAlbum[]> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=20`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ItunesSearchResponse = await response.json();
    return data.results.filter(
      (item): item is ItunesAlbum => item.wrapperType === "collection"
    );
  } catch (error) {
    console.error("Failed to get artist albums:", error);
    return [];
  }
}

export async function searchTracksByGenre(
  genre: string,
  excludeTrackId: number
): Promise<ItunesTrack[]> {
  try {
    const encodedGenre = encodeURIComponent(genre);
    const url = `https://itunes.apple.com/search?term=${encodedGenre}&media=music&entity=musicTrack&limit=12`;

    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ItunesSearchResponse = await response.json();
    return data.results
      .filter(
        (item): item is ItunesTrack =>
          item.wrapperType === "track" &&
          (item as ItunesTrack).trackId !== excludeTrackId
      )
      .slice(0, 8);
  } catch (error) {
    console.error("Failed to search tracks by genre:", error);
    return [];
  }
}

// --- Structured error versions for graceful degradation ---

export async function searchTracksWithError(
  query: string,
  entity?: string
): Promise<ApiResult<ItunesTrack[]>> {
  try {
    const encodedQuery = encodeURIComponent(query);
    let url = `https://itunes.apple.com/search?term=${encodedQuery}&media=music&limit=25&entity=musicTrack`;

    if (entity === "song") {
      url += "&attribute=songTerm";
    }

    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      return {
        data: null,
        error: classifyError(new Error(`HTTP ${response.status}`), response.status),
      };
    }

    const data: ItunesSearchResponse = await response.json();
    const tracks = data.results.filter(
      (item): item is ItunesTrack => item.wrapperType === "track"
    );

    return { data: tracks, error: null };
  } catch (error) {
    console.error("Failed to search tracks:", error);
    return { data: null, error: classifyError(error) };
  }
}

export async function searchArtistsWithError(
  query: string
): Promise<ApiResult<ItunesArtist[]>> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://itunes.apple.com/search?term=${encodedQuery}&entity=musicArtist&limit=25`;

    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      return {
        data: null,
        error: classifyError(new Error(`HTTP ${response.status}`), response.status),
      };
    }

    const data: ItunesSearchResponse = await response.json();
    const artists = data.results.filter(
      (item): item is ItunesArtist => item.wrapperType === "artist"
    );

    return { data: artists, error: null };
  } catch (error) {
    console.error("Failed to search artists:", error);
    return { data: null, error: classifyError(error) };
  }
}

export async function searchAlbumsWithError(
  query: string
): Promise<ApiResult<ItunesAlbum[]>> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://itunes.apple.com/search?term=${encodedQuery}&entity=album&limit=25`;

    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      return {
        data: null,
        error: classifyError(new Error(`HTTP ${response.status}`), response.status),
      };
    }

    const data: ItunesSearchResponse = await response.json();
    const albums = data.results.filter(
      (item): item is ItunesAlbum => item.wrapperType === "collection"
    );

    return { data: albums, error: null };
  } catch (error) {
    console.error("Failed to search albums:", error);
    return { data: null, error: classifyError(error) };
  }
}
