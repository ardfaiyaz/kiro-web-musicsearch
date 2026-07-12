"use client";

import { getListeningHistory, type HistoryEntry } from "@/lib/personalization";

const CHALLENGES_KEY = "music-search-challenges";
const CHALLENGE_PROGRESS_KEY = "music-search-challenge-progress";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  type: "genre" | "artist" | "count" | "duration" | "discovery";
  criteria: string;
  weekStart: number;
  weekEnd: number;
}

export interface ChallengeProgress {
  challengeId: string;
  current: number;
  completed: boolean;
  completedAt?: number;
}

const CHALLENGE_TEMPLATES = [
  { title: "Jazz Explorer", description: "Listen to 5 jazz tracks this week", target: 5, type: "genre" as const, criteria: "Jazz" },
  { title: "Rock Marathon", description: "Listen to 10 rock tracks this week", target: 10, type: "genre" as const, criteria: "Rock" },
  { title: "Pop Enthusiast", description: "Listen to 8 pop tracks this week", target: 8, type: "genre" as const, criteria: "Pop" },
  { title: "Hip-Hop Head", description: "Listen to 5 hip-hop tracks this week", target: 5, type: "genre" as const, criteria: "Hip-Hop" },
  { title: "Electronic Vibes", description: "Listen to 6 electronic tracks this week", target: 6, type: "genre" as const, criteria: "Electronic" },
  { title: "Country Roads", description: "Listen to 4 country tracks this week", target: 4, type: "genre" as const, criteria: "Country" },
  { title: "Classical Touch", description: "Listen to 3 classical tracks this week", target: 3, type: "genre" as const, criteria: "Classical" },
  { title: "R&B Smooth", description: "Listen to 5 R&B tracks this week", target: 5, type: "genre" as const, criteria: "R&B" },
  { title: "Discovery Streak", description: "Listen to 10 different artists this week", target: 10, type: "discovery" as const, criteria: "unique_artists" },
  { title: "Album Diver", description: "Listen to tracks from 5 different albums", target: 5, type: "discovery" as const, criteria: "unique_albums" },
  { title: "Song Collector", description: "Listen to 15 tracks this week", target: 15, type: "count" as const, criteria: "total" },
  { title: "Music Marathon", description: "Listen to 20 tracks this week", target: 20, type: "count" as const, criteria: "total" },
];

function getWeekBounds(): { start: number; end: number } {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday.getTime(), end: sunday.getTime() };
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getWeeklyChallenges(): Challenge[] {
  if (typeof window === "undefined") return [];

  const { start, end } = getWeekBounds();
  const stored = localStorage.getItem(CHALLENGES_KEY);

  if (stored) {
    try {
      const challenges: Challenge[] = JSON.parse(stored);
      if (challenges.length > 0 && challenges[0].weekStart === start) {
        return challenges;
      }
    } catch {
      // regenerate
    }
  }

  // Generate 3 challenges for this week using week start as seed
  const seed = Math.floor(start / 1000);
  const indices: number[] = [];
  let attempt = 0;
  while (indices.length < 3 && attempt < 20) {
    const idx = Math.floor(seededRandom(seed + attempt) * CHALLENGE_TEMPLATES.length);
    if (!indices.includes(idx)) {
      indices.push(idx);
    }
    attempt++;
  }

  const challenges: Challenge[] = indices.map((idx, i) => {
    const template = CHALLENGE_TEMPLATES[idx];
    return {
      id: `challenge-${start}-${i}`,
      title: template.title,
      description: template.description,
      target: template.target,
      type: template.type,
      criteria: template.criteria,
      weekStart: start,
      weekEnd: end,
    };
  });

  try {
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  } catch {
    // quota exceeded
  }

  return challenges;
}

export function getChallengeProgress(challenges: Challenge[]): ChallengeProgress[] {
  if (typeof window === "undefined") return [];

  const history = getListeningHistory();
  const { start } = getWeekBounds();

  // Filter history to this week
  const weekHistory = history.filter((entry) => entry.playedAt >= start);

  // Load saved progress for completion timestamps
  let savedProgress: ChallengeProgress[] = [];
  try {
    const stored = localStorage.getItem(CHALLENGE_PROGRESS_KEY);
    if (stored) savedProgress = JSON.parse(stored);
  } catch {
    // ignore
  }

  const progressList: ChallengeProgress[] = challenges.map((challenge) => {
    let current = 0;

    switch (challenge.type) {
      case "genre":
        current = weekHistory.filter((e) =>
          e.primaryGenreName?.toLowerCase().includes(challenge.criteria.toLowerCase())
        ).length;
        break;
      case "count":
        current = weekHistory.length;
        break;
      case "discovery":
        if (challenge.criteria === "unique_artists") {
          const uniqueArtists = new Set(weekHistory.map((e) => e.artistName));
          current = uniqueArtists.size;
        } else if (challenge.criteria === "unique_albums") {
          const uniqueAlbums = new Set(weekHistory.map((e) => e.albumName));
          current = uniqueAlbums.size;
        }
        break;
      default:
        current = 0;
    }

    const completed = current >= challenge.target;
    const saved = savedProgress.find((p) => p.challengeId === challenge.id);

    return {
      challengeId: challenge.id,
      current: Math.min(current, challenge.target),
      completed,
      completedAt: completed ? (saved?.completedAt || Date.now()) : undefined,
    };
  });

  // Save progress
  try {
    localStorage.setItem(CHALLENGE_PROGRESS_KEY, JSON.stringify(progressList));
  } catch {
    // quota exceeded
  }

  return progressList;
}

export function getHistoryForWeek(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const history = getListeningHistory();
  const { start } = getWeekBounds();
  return history.filter((entry) => entry.playedAt >= start);
}
