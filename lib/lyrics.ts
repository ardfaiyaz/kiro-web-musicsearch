const LYRICS_API_BASE = "https://api.lyrics.ovh/v1";

/**
 * Fetch song lyrics from the lyrics.ovh API.
 * Returns the lyrics text or null if not found or on error.
 */
export async function getLyrics(
  artist: string,
  title: string
): Promise<string | null> {
  try {
    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);
    const url = `${LYRICS_API_BASE}/${encodedArtist}/${encodedTitle}`;

    const response = await fetch(url, { next: { revalidate: 86400 } });

    if (!response.ok) {
      return null;
    }

    const data: { lyrics?: string } = await response.json();

    if (!data.lyrics || data.lyrics.trim().length === 0) {
      return null;
    }

    return data.lyrics.trim();
  } catch (error) {
    console.error("Failed to fetch lyrics:", error);
    return null;
  }
}
