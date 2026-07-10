export interface RSSFeedItem {
  id: string;
  artistName: string;
  name: string;
  artworkUrl100: string;
  url: string;
  releaseDate?: string;
  genres?: { genreId: string; name: string; url: string }[];
}

export interface RSSFeedResponse {
  feed: {
    title: string;
    results: RSSFeedItem[];
  };
}

export async function getTrendingSongs(): Promise<RSSFeedItem[]> {
  try {
    const response = await fetch(
      "https://rss.applemarketingtools.com/api/v2/us/music/most-played/25/songs.json",
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`RSS API error: ${response.status}`);
    }

    const data: RSSFeedResponse = await response.json();
    return data.feed.results || [];
  } catch (error) {
    console.error("Failed to fetch trending songs:", error);
    return [];
  }
}

export async function getNewReleases(): Promise<RSSFeedItem[]> {
  try {
    // Use iTunes Search API for recent releases since the RSS new-releases endpoint is unavailable
    const response = await fetch(
      "https://itunes.apple.com/search?term=new+music+2024&media=music&entity=album&limit=25&sort=recent",
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data = await response.json();
    const results = (data.results || [])
      .filter((item: { wrapperType: string }) => item.wrapperType === "collection")
      .slice(0, 25)
      .map((album: { collectionId: number; artistName: string; collectionName: string; artworkUrl100: string; collectionViewUrl: string; releaseDate: string }) => ({
        id: album.collectionId.toString(),
        artistName: album.artistName,
        name: album.collectionName,
        artworkUrl100: album.artworkUrl100 || "",
        url: album.collectionViewUrl || "",
        releaseDate: album.releaseDate,
      }));

    return results;
  } catch (error) {
    console.error("Failed to fetch new releases:", error);
    return [];
  }
}

export async function getTopAlbums(): Promise<RSSFeedItem[]> {
  try {
    const response = await fetch(
      "https://rss.applemarketingtools.com/api/v2/us/music/most-played/25/albums.json",
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`RSS API error: ${response.status}`);
    }

    const data: RSSFeedResponse = await response.json();
    return data.feed.results || [];
  } catch (error) {
    console.error("Failed to fetch top albums:", error);
    return [];
  }
}

export interface Genre {
  id: string;
  name: string;
  gradient: string;
}

export const GENRES: Genre[] = [
  { id: "pop", name: "Pop", gradient: "from-pink-500 to-rose-500" },
  { id: "rock", name: "Rock", gradient: "from-red-600 to-orange-500" },
  { id: "hip-hop-rap", name: "Hip-Hop/Rap", gradient: "from-purple-600 to-indigo-500" },
  { id: "electronic", name: "Electronic", gradient: "from-cyan-500 to-blue-500" },
  { id: "jazz", name: "Jazz", gradient: "from-amber-500 to-yellow-500" },
  { id: "classical", name: "Classical", gradient: "from-slate-600 to-slate-400" },
  { id: "country", name: "Country", gradient: "from-orange-500 to-amber-400" },
  { id: "r-and-b-soul", name: "R&B/Soul", gradient: "from-violet-600 to-purple-500" },
  { id: "latin", name: "Latin", gradient: "from-green-500 to-emerald-400" },
  { id: "alternative", name: "Alternative", gradient: "from-teal-500 to-cyan-400" },
  { id: "indie", name: "Indie", gradient: "from-rose-400 to-pink-400" },
  { id: "metal", name: "Metal", gradient: "from-gray-800 to-gray-600" },
];
