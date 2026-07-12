"use client";

const STREAKS_KEY = "music-search-streaks";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastListeningDate: string;
  streakStartDate: string;
}

function getDateString(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + "T00:00:00");
  const d2 = new Date(dateStr2 + "T00:00:00");
  return Math.round(
    Math.abs(d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000)
  );
}

export function getStoredStreaks(): StreakData {
  if (typeof window === "undefined") {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastListeningDate: "",
      streakStartDate: "",
    };
  }
  try {
    const stored = localStorage.getItem(STREAKS_KEY);
    if (stored) return JSON.parse(stored) as StreakData;
  } catch {
    // ignore
  }
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastListeningDate: "",
    streakStartDate: "",
  };
}

export function saveStreaks(data: StreakData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STREAKS_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export interface HistoryTimestamp {
  playedAt: number;
}

export function computeStreaksFromHistory(
  history: HistoryTimestamp[],
  now: number
): StreakData {
  if (history.length === 0 || now === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastListeningDate: "",
      streakStartDate: "",
    };
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Build set of active day strings
  const activeDays = new Set<string>();
  for (const entry of history) {
    activeDays.add(getDateString(entry.playedAt));
  }

  const todayStr = getDateString(now);

  // Compute current streak (counting backwards from today)
  let currentStreak = 0;
  let checkTime = today.getTime();
  for (let i = 0; i < 365; i++) {
    const checkStr = getDateString(checkTime);
    if (activeDays.has(checkStr)) {
      currentStreak++;
      checkTime -= dayMs;
    } else {
      break;
    }
  }

  // Compute longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDays = Array.from(activeDays).sort();
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const diff = daysBetween(sortedDays[i - 1], sortedDays[i]);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  const lastListeningDate = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1] : "";
  const streakStartDate =
    currentStreak > 0
      ? getDateString(today.getTime() - (currentStreak - 1) * dayMs)
      : todayStr;

  const data: StreakData = {
    currentStreak,
    longestStreak,
    lastListeningDate,
    streakStartDate,
  };

  saveStreaks(data);
  return data;
}

export function getMotivationalMessage(streak: number): string {
  if (streak === 0) return "Start listening to begin your streak!";
  if (streak === 1) return "Great start! Keep it going tomorrow!";
  if (streak < 3) return "Nice momentum! You are building a habit!";
  if (streak < 7) return "Impressive! Almost a full week!";
  if (streak === 7) return "One full week! You are on fire!";
  if (streak < 14) return "Incredible dedication! Keep the streak alive!";
  if (streak < 30) return "Music is clearly part of your daily routine!";
  if (streak < 60) return "A whole month of music! Legendary!";
  return "Unstoppable! You are a true music devotee!";
}
