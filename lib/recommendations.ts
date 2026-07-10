import { ItunesTrack, ItunesSearchResponse } from "./types";

/**
 * Genre-based related search terms for finding similar music.
 * Maps primary genres to related search keywords that capture
 * similar mood, style, and musical characteristics.
 */
const GENRE_SEARCH_MAP: Record<string, string[]> = {
  Pop: ["pop hits", "dance pop", "synth pop", "indie pop", "electropop"],
  Rock: ["rock", "alternative rock", "indie rock", "classic rock", "garage rock"],
  Alternative: ["alternative", "indie", "shoegaze", "post-punk", "dream pop"],
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
  "K-Pop": ["k-pop", "korean pop", "k-pop dance", "k-pop ballad", "korean r&b"],
  Anime: ["anime", "j-pop", "japanese pop", "anime soundtrack", "vocaloid"],
  "Christian & Gospel": ["gospel", "christian", "worship", "contemporary christian", "praise"],
  "Fitness & Workout": ["workout", "fitness", "running music", "gym", "high energy"],
  "Children's Music": ["children", "kids music", "nursery", "lullaby", "family"],
  World: ["world music", "afrobeat", "celtic", "middle eastern", "indian"],
  "New Age": ["new age", "meditation", "relaxation", "ambient", "healing"],
  Punk: ["punk", "punk rock", "pop punk", "hardcore", "emo"],
  "Singer/Songwriter": ["singer-songwriter", "acoustic", "folk", "indie", "vocal"],
  Funk: ["funk", "funky", "groove", "disco funk", "soul funk"],
  Disco: ["disco", "nu disco", "dance", "boogie", "funky"],
  "J-Pop": ["j-pop", "japanese pop", "anime", "city pop", "j-rock"],
  Afrobeats: ["afrobeats", "afro pop", "afro house", "amapiano", "highlife"],
  Indie: ["indie", "indie rock", "indie pop", "lo-fi", "bedroom pop"],
  "Lo-Fi": ["lo-fi", "lo-fi beats", "chill hop", "study music", "ambient beats"],
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
 * Simple deterministic hash function that produces a numeric seed
 * from a trackId. Used to create repeatable shuffles for caching.
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Deterministic shuffle using a seeded PRNG (Fisher-Yates algorithm).
 * Ensures the same trackId always produces the same order, making
 * cache headers meaningful.
 */
function deterministicShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  const random = seededRandom(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates multiple search strategies based on the source track's
 * genre, artist style, and musical characteristics.
 * Uses a deterministic shuffle seeded by trackId so that the same
 * track always produces the same strategies, enabling effective caching.
 */
function generateSearchStrategies(track: ItunesTrack): string[] {
  const strategies: string[] = [];
  const genre = track.primaryGenreName;

  // Strategy 1: Genre-based searches (deterministic selection)
  const genreTerms = GENRE_SEARCH_MAP[genre];
  if (genreTerms && genreTerms.length > 0) {
    // Pick 2 genre terms deterministically based on trackId
    const shuffled = deterministicShuffle(genreTerms, track.trackId);
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

    // Deduplicate search terms before fetching to avoid redundant HTTP requests
    const uniqueTerms = [...new Set(strategies.map((term) => term.toLowerCase().trim()))];

    // Execute all unique search strategies in parallel
    const results = await Promise.allSettled(
      uniqueTerms.map((term) => fetchTracksForTerm(term))
    );

    // Collect all tracks from successful queries and track if any succeeded
    const allTracks: ItunesTrack[] = [];
    let anyStrategySucceeded = false;

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.length > 0) {
          anyStrategySucceeded = true;
        }
        allTracks.push(...result.value);
      }
    }

    // If all strategies returned zero tracks, treat it as an error.
    // This catches the case where all iTunes API calls failed silently
    // (fetchTracksForTerm swallows errors and returns []).
    if (!anyStrategySucceeded) {
      return { tracks: [], error: true };
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
