import { ItunesTrack, ItunesSearchResponse } from "./types";

export interface RecommendedTrack extends ItunesTrack {
  reason: string;
}

export interface MoodRecommendationsResult {
  tracks: RecommendedTrack[];
  error: boolean;
}

const MOOD_SEARCH_MAP: Record<string, { terms: string[]; reason: string }> = {
  happy: {
    terms: ["happy pop", "feel good music", "upbeat songs", "cheerful"],
    reason: "Matches happy, upbeat mood",
  },
  sad: {
    terms: ["sad songs", "melancholy", "heartbreak ballad", "emotional acoustic"],
    reason: "Matches reflective, melancholy mood",
  },
  energetic: {
    terms: ["high energy", "pump up music", "adrenaline", "power anthem"],
    reason: "Matches high-energy, intense mood",
  },
  chill: {
    terms: ["chill vibes", "lo-fi beats", "relaxing music", "ambient chill"],
    reason: "Matches calm, relaxing mood",
  },
  romantic: {
    terms: ["love songs", "romantic ballad", "romantic duet", "slow dance"],
    reason: "Matches romantic, intimate mood",
  },
  dark: {
    terms: ["dark electronic", "dark ambient", "moody indie", "gothic rock"],
    reason: "Matches dark, atmospheric mood",
  },
};

const ACTIVITY_SEARCH_MAP: Record<string, { terms: string[]; reason: string }> = {
  workout: {
    terms: ["workout music", "gym motivation", "running playlist", "high tempo"],
    reason: "Great for working out",
  },
  study: {
    terms: ["study music", "focus beats", "instrumental concentration", "lo-fi study"],
    reason: "Helps with focus and study",
  },
  sleep: {
    terms: ["sleep music", "lullaby ambient", "relaxing sleep sounds", "calm piano"],
    reason: "Soothing for sleep and rest",
  },
  driving: {
    terms: ["driving songs", "road trip music", "highway anthem", "cruise music"],
    reason: "Perfect for driving",
  },
  party: {
    terms: ["party music", "dance hits", "club anthems", "party starters"],
    reason: "Gets the party going",
  },
  cooking: {
    terms: ["cooking music", "jazz dinner", "bossa nova", "kitchen playlist"],
    reason: "Great background for cooking",
  },
};

async function fetchTracksForTerm(term: string): Promise<ItunesTrack[]> {
  try {
    const encodedTerm = encodeURIComponent(term);
    const url = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=musicTrack&limit=10`;

    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      return [];
    }

    const data: ItunesSearchResponse = await response.json();
    return data.results.filter(
      (item): item is ItunesTrack => item.wrapperType === "track"
    );
  } catch {
    return [];
  }
}

function deduplicateTracks(tracks: ItunesTrack[]): ItunesTrack[] {
  const seen = new Set<number>();
  const unique: ItunesTrack[] = [];
  for (const track of tracks) {
    if (!seen.has(track.trackId)) {
      seen.add(track.trackId);
      unique.push(track);
    }
  }
  return unique;
}

export async function getRecommendationsByMood(
  mood: string
): Promise<MoodRecommendationsResult> {
  const config = MOOD_SEARCH_MAP[mood.toLowerCase()];
  if (!config) {
    return { tracks: [], error: true };
  }

  try {
    const results = await Promise.allSettled(
      config.terms.map((term) => fetchTracksForTerm(term))
    );

    const allTracks: ItunesTrack[] = [];
    let anySuccess = false;

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.length > 0) {
        anySuccess = true;
        allTracks.push(...result.value);
      }
    }

    if (!anySuccess) {
      return { tracks: [], error: true };
    }

    const unique = deduplicateTracks(allTracks);
    const recommended: RecommendedTrack[] = unique.slice(0, 12).map((track) => ({
      ...track,
      reason: config.reason,
    }));

    return { tracks: recommended, error: false };
  } catch {
    return { tracks: [], error: true };
  }
}

export async function getRecommendationsByActivity(
  activity: string
): Promise<MoodRecommendationsResult> {
  const config = ACTIVITY_SEARCH_MAP[activity.toLowerCase()];
  if (!config) {
    return { tracks: [], error: true };
  }

  try {
    const results = await Promise.allSettled(
      config.terms.map((term) => fetchTracksForTerm(term))
    );

    const allTracks: ItunesTrack[] = [];
    let anySuccess = false;

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.length > 0) {
        anySuccess = true;
        allTracks.push(...result.value);
      }
    }

    if (!anySuccess) {
      return { tracks: [], error: true };
    }

    const unique = deduplicateTracks(allTracks);
    const recommended: RecommendedTrack[] = unique.slice(0, 12).map((track) => ({
      ...track,
      reason: config.reason,
    }));

    return { tracks: recommended, error: false };
  } catch {
    return { tracks: [], error: true };
  }
}

function getDecade(releaseDate: string): string {
  const year = new Date(releaseDate).getFullYear();
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

export async function getSimilarTracks(
  track: ItunesTrack
): Promise<MoodRecommendationsResult> {
  try {
    const genre = track.primaryGenreName;
    const decade = getDecade(track.releaseDate);

    const searchTerms = [
      `${genre} ${decade}`,
      `${track.artistName} style`,
      `${genre} similar`,
    ];

    const results = await Promise.allSettled(
      searchTerms.map((term) => fetchTracksForTerm(term))
    );

    const allTracks: ItunesTrack[] = [];
    let anySuccess = false;

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.length > 0) {
        anySuccess = true;
        allTracks.push(...result.value);
      }
    }

    if (!anySuccess) {
      return { tracks: [], error: true };
    }

    const filtered = allTracks.filter(
      (t) => t.trackId !== track.trackId && t.artistId !== track.artistId
    );

    const unique = deduplicateTracks(filtered);

    const recommended: RecommendedTrack[] = unique.slice(0, 12).map((t) => {
      let reason: string;
      if (t.primaryGenreName === genre) {
        reason = `Same genre: ${genre}`;
      } else if (getDecade(t.releaseDate) === decade) {
        reason = `Similar era: ${decade}`;
      } else {
        reason = "Related artist";
      }
      return { ...t, reason };
    });

    return { tracks: recommended, error: false };
  } catch {
    return { tracks: [], error: true };
  }
}

export async function getHiddenGems(
  genre: string
): Promise<MoodRecommendationsResult> {
  try {
    const searchTerms = [
      `${genre} underground`,
      `${genre} indie new`,
      `${genre} hidden gem`,
    ];

    const results = await Promise.allSettled(
      searchTerms.map((term) => fetchTracksForTerm(term))
    );

    const allTracks: ItunesTrack[] = [];
    let anySuccess = false;

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.length > 0) {
        anySuccess = true;
        allTracks.push(...result.value);
      }
    }

    if (!anySuccess) {
      return { tracks: [], error: true };
    }

    const unique = deduplicateTracks(allTracks);
    const recommended: RecommendedTrack[] = unique.slice(0, 8).map((t) => ({
      ...t,
      reason: `Hidden gem in ${genre}`,
    }));

    return { tracks: recommended, error: false };
  } catch {
    return { tracks: [], error: true };
  }
}

export async function getTrendingInGenre(
  genre: string
): Promise<MoodRecommendationsResult> {
  try {
    const searchTerms = [
      `${genre} trending 2024`,
      `${genre} popular new`,
    ];

    const results = await Promise.allSettled(
      searchTerms.map((term) => fetchTracksForTerm(term))
    );

    const allTracks: ItunesTrack[] = [];
    let anySuccess = false;

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.length > 0) {
        anySuccess = true;
        allTracks.push(...result.value);
      }
    }

    if (!anySuccess) {
      return { tracks: [], error: true };
    }

    const unique = deduplicateTracks(allTracks);
    const recommended: RecommendedTrack[] = unique.slice(0, 10).map((t) => ({
      ...t,
      reason: `Trending in ${genre}`,
    }));

    return { tracks: recommended, error: false };
  } catch {
    return { tracks: [], error: true };
  }
}

export const MOODS = [
  { id: "happy", name: "Happy", emoji: "\u2600\uFE0F", gradient: "from-yellow-400 to-orange-400" },
  { id: "sad", name: "Sad", emoji: "\uD83C\uDF27\uFE0F", gradient: "from-blue-400 to-indigo-500" },
  { id: "energetic", name: "Energetic", emoji: "\u26A1", gradient: "from-red-500 to-pink-500" },
  { id: "chill", name: "Chill", emoji: "\uD83C\uDF3F", gradient: "from-green-400 to-teal-400" },
  { id: "romantic", name: "Romantic", emoji: "\uD83D\uDC96", gradient: "from-pink-400 to-rose-400" },
  { id: "dark", name: "Dark", emoji: "\uD83C\uDF11", gradient: "from-gray-700 to-gray-900" },
] as const;

export const ACTIVITIES = [
  { id: "workout", name: "Workout", emoji: "\uD83C\uDFCB\uFE0F", gradient: "from-orange-500 to-red-500" },
  { id: "study", name: "Study", emoji: "\uD83D\uDCDA", gradient: "from-indigo-400 to-purple-400" },
  { id: "sleep", name: "Sleep", emoji: "\uD83C\uDF19", gradient: "from-slate-500 to-blue-700" },
  { id: "driving", name: "Driving", emoji: "\uD83D\uDE97", gradient: "from-cyan-500 to-blue-500" },
  { id: "party", name: "Party", emoji: "\uD83C\uDF89", gradient: "from-fuchsia-500 to-violet-500" },
] as const;
