import { ItunesTrack, ItunesSearchResponse } from "./types";

/**
 * Genre-based related search terms for finding similar music.
 * Maps primary genres to related search keywords that capture
 * similar mood, style, and musical characteristics.
 */
const GENRE_SEARCH_MAP: Record<string, string[]> = {
  Pop: ["pop hits", "dance pop", "synth pop", "indie pop", "electropop"],
  Rock: ["rock", "alternative rock", "indie rock", "classic rock", "garage rock"],
  "Alternative": ["alternative", "indie", "shoegaze", "post-punk", "dream pop"],
  "Hip-Hop/Rap": ["hip hop", "rap", "trap", "boom bap", "conscious rap"],
  "R&B/Soul": ["r&b", "soul", "neo soul", "contemporary r&b", "funk"],
  Electronic: ["electronic", "edm", "house", "techno", "ambient"],
  Dance: ["dance", "house music", "disco", "edm", "club"],
  Country: ["country", "americana", "country pop", "folk country", "bluegrass"],
  Jazz: ["jazz", "smooth jazz", "bebop", "jazz fusion", "vocal jazz"],
  Classical: ["classical", "orchestral", "chamber music", "piano classical", "symphony"],
  Metal: ["metal", "heavy metal", "progressive metal", "metalcore", "thrash"],
  Folk: ["folk", "indie folk", "acoustic", "singer-songwriter", "folk rock"],
  Reggae: ["reggae", "dancehall", "dub", "ska", "roots reggae"],
  Blues: ["blues", "blues rock", "delta blues", "electric blues", "soul blues"],
  Latin: ["latin", "reggaeton", "salsa", "latin pop", "bachata"],
  Soundtrack: ["soundtrack", "film score", "cinematic", "orchestral", "instrumental"],
  Singer: ["singer-songwriter", "acoustic", "folk", "indie", "vocal"],
};

/**
 * Extracts mood and style keywords from track and album names
 * to generate more targeted search queries.
 */
function extractStyleKeywords(track: ItunesTrack): string[] {
  const keywords: string[] = [];
  const combinedText = `${track.trackName} ${track.collectionName}`.toLowerCase();

  const moodWords = [
    "love", "night", "dream", "heart", "fire", "dark", "light",
    "summer", "rain", "dance", "happy", "sad", "chill", "wild",
    "electric", "golden", "midnight", "sunrise", "sunset", "ocean",
  ];

  for (const word of moodWords) {
    if (combinedText.includes(word)) {
      keywords.push(word);
    }
  }

  return keywords.slice(0, 3);
}

/**
 * Generates multiple search strategies based on the source track's
 * genre, artist style, and musical characteristics.
 */
function generateSearchStrategies(track: ItunesTrack): string[] {
  const strategies: string[] = [];
  const genre = track.primaryGenreName;

  // Strategy 1: Genre-based searches
  const genreTerms = GENRE_SEARCH_MAP[genre];
  if (genreTerms && genreTerms.length > 0) {
    // Pick 2 random genre terms for variety
    const shuffled = [...genreTerms].sort(() => Math.random() - 0.5);
    strategies.push(shuffled[0]);
    if (shuffled.length > 1) {
      strategies.push(shuffled[1]);
    }
  } else {
    // Fallback: use the genre name directly
    strategies.push(genre.toLowerCase());
  }

  // Strategy 2: Mood/style keywords from track metadata
  const styleKeywords = extractStyleKeywords(track);
  if (styleKeywords.length > 0) {
    strategies.push(`${styleKeywords[0]} ${genre.toLowerCase()}`);
  }

  // Strategy 3: Genre combined with a general music discovery term
  strategies.push(`${genre.toLowerCase()} new music`);

  // Strategy 4: Use part of the track name for thematic similarity
  const trackWords = track.trackName
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  if (trackWords.length > 0) {
    strategies.push(`${trackWords[0]} ${genre.toLowerCase()}`);
  }

  return strategies;
}

/**
 * Fetches tracks from the iTunes API for a given search term.
 */
async function fetchTracksForTerm(term: string): Promise<ItunesTrack[]> {
  try {
    const encodedTerm = encodeURIComponent(term);
    const url = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=musicTrack&limit=10`;

    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      return [];
    }

    const data: ItunesSearchResponse = await response.json();
    return data.results.filter((item) => item.wrapperType === "track");
  } catch {
    return [];
  }
}

export interface RecommendationsResult {
  tracks: ItunesTrack[];
  error: boolean;
}

/**
 * Generates intelligent recommendations for a given source track.
 * Queries the iTunes API with varied search strategies based on genre,
 * mood, and musical characteristics. Filters out same-artist tracks,
 * deduplicates results, and returns at least 5 recommendations when available.
 */
export async function getRecommendations(
  sourceTrack: ItunesTrack
): Promise<RecommendationsResult> {
  try {
    const strategies = generateSearchStrategies(sourceTrack);

    // Execute all search strategies in parallel
    const results = await Promise.allSettled(
      strategies.map((term) => fetchTracksForTerm(term))
    );

    // Collect all tracks from successful queries
    const allTracks: ItunesTrack[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allTracks.push(...result.value);
      }
    }

    // Filter out tracks from the same artist
    const filteredTracks = allTracks.filter(
      (track) => track.artistId !== sourceTrack.artistId
    );

    // Deduplicate by trackId
    const seen = new Set<number>();
    const uniqueTracks: ItunesTrack[] = [];
    for (const track of filteredTracks) {
      if (!seen.has(track.trackId) && track.trackId !== sourceTrack.trackId) {
        seen.add(track.trackId);
        uniqueTracks.push(track);
      }
    }

    // Rank by relevance: prioritize genre match over others
    const ranked = uniqueTracks.sort((a, b) => {
      const aGenreMatch = a.primaryGenreName === sourceTrack.primaryGenreName ? 1 : 0;
      const bGenreMatch = b.primaryGenreName === sourceTrack.primaryGenreName ? 1 : 0;
      return bGenreMatch - aGenreMatch;
    });

    // Return top recommendations (aim for at least 5, max 12)
    return {
      tracks: ranked.slice(0, 12),
      error: false,
    };
  } catch (error) {
    console.error("Failed to generate recommendations:", error);
    return { tracks: [], error: true };
  }
}
