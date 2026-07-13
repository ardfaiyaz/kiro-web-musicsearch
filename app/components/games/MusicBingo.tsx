"use client";

import { useState, useSyncExternalStore } from "react";
import { Trophy, RefreshCw, Star } from "lucide-react";

interface BingoSquare {
  id: string;
  text: string;
  marked: boolean;
}

const BINGO_KEY = "music-search-bingo-card";
const BINGO_DATE_KEY = "music-search-bingo-date";

function subscribeNoop() {
  return () => {};
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

const ALL_CRITERIA: string[] = [
  "Listen to a jazz song",
  "Find a song from the 80s",
  "Play a song over 5 minutes",
  "Listen to an indie track",
  "Find a song with Love in the title",
  "Play a hip-hop track",
  "Listen to a rock anthem",
  "Find an album with 10+ tracks",
  "Play a song from this year",
  "Listen to classical music",
  "Find a song under 2 minutes",
  "Play music from another country",
  "Listen to an electronic track",
  "Find a one-word song title",
  "Play a collaboration track",
  "Listen to R&B or soul",
  "Find a debut album",
  "Play a live recording",
  "Listen to a soundtrack song",
  "Find an artist with 1 name",
  "Play a song from the 90s",
  "Listen to country music",
  "Find a remix or remaster",
  "Play a song with no vocals",
  "Listen to folk or acoustic",
  "Find an explicit track",
  "Play music from the 2000s",
  "Listen to a duet",
  "Find a holiday song",
  "Play a breakup song",
  "Listen to metal or punk",
  "Find a greatest hits album",
];

function generateCard(seed: number): BingoSquare[] {
  // Use seed to generate consistent daily card
  const shuffled = [...ALL_CRITERIA];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(((Math.sin(seed + i) + 1) / 2) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, 25);
  // Center square is always FREE
  selected[12] = "FREE SPACE";

  return selected.map((text, idx) => ({
    id: `bingo-${idx}`,
    text,
    marked: idx === 12, // Free space is always marked
  }));
}

function checkBingo(squares: BingoSquare[]): boolean {
  if (squares.length < 25) return false;
  
  // Check rows
  for (let row = 0; row < 5; row++) {
    let rowComplete = true;
    for (let col = 0; col < 5; col++) {
      if (!squares[row * 5 + col].marked) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) return true;
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    let colComplete = true;
    for (let row = 0; row < 5; row++) {
      if (!squares[row * 5 + col].marked) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) return true;
  }

  // Check diagonals
  let diag1 = true;
  let diag2 = true;
  for (let i = 0; i < 5; i++) {
    if (!squares[i * 5 + i].marked) diag1 = false;
    if (!squares[i * 5 + (4 - i)].marked) diag2 = false;
  }

  return diag1 || diag2;
}

function loadOrCreateCard(): BingoSquare[] {
  if (typeof window === "undefined") return [];
  const today = getTodayString();
  const storedDate = localStorage.getItem(BINGO_DATE_KEY);
  const storedCard = localStorage.getItem(BINGO_KEY);

  if (storedDate === today && storedCard) {
    try {
      return JSON.parse(storedCard) as BingoSquare[];
    } catch {
      // regenerate
    }
  }

  const seed = today.split("-").reduce((acc, val) => acc + parseInt(val), 0);
  const card = generateCard(seed);

  try {
    localStorage.setItem(BINGO_KEY, JSON.stringify(card));
    localStorage.setItem(BINGO_DATE_KEY, today);
  } catch {
    // ignore
  }

  return card;
}

const emptyCard: BingoSquare[] = [];

function getServerCard(): BingoSquare[] {
  return emptyCard;
}

export default function MusicBingo() {
  const initialCard = useSyncExternalStore(subscribeNoop, loadOrCreateCard, getServerCard);
  const [squares, setSquares] = useState<BingoSquare[]>(initialCard);
  const [hasBingo, setHasBingo] = useState(() => initialCard.length === 25 ? checkBingo(initialCard) : false);
  const [markedCount, setMarkedCount] = useState(() => initialCard.filter((s) => s.marked).length);

  const toggleSquare = (index: number) => {
    if (index === 12) return; // Can't toggle free space

    const updated = squares.map((sq, i) =>
      i === index ? { ...sq, marked: !sq.marked } : sq
    );
    setSquares(updated);
    setMarkedCount(updated.filter((s) => s.marked).length);
    setHasBingo(checkBingo(updated));

    try {
      localStorage.setItem(BINGO_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const resetCard = () => {
    try {
      localStorage.removeItem(BINGO_KEY);
      localStorage.removeItem(BINGO_DATE_KEY);
    } catch {
      // ignore
    }
    const card = loadOrCreateCard();
    setSquares(card);
    setMarkedCount(card.filter((s) => s.marked).length);
    setHasBingo(checkBingo(card));
  };

  if (squares.length === 0) {
    return (
      <div className="flex items-center justify-center py-16" aria-busy="true">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Stats */}
      <div className="flex w-full items-center justify-between">
        <span className="text-sm text-muted">
          {markedCount} of 25 squares marked
        </span>
        <button
          onClick={resetCard}
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
          aria-label="New bingo card"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          New Card
        </button>
      </div>

      {/* Bingo status */}
      {hasBingo && (
        <div className="flex items-center gap-3 rounded-xl border-2 border-yellow-500 bg-yellow-500/10 px-6 py-3">
          <Trophy className="h-6 w-6 text-yellow-500" aria-hidden="true" />
          <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
            BINGO! You got a line!
          </span>
        </div>
      )}

      {/* Bingo card grid */}
      <div
        className="grid w-full max-w-lg grid-cols-5 gap-1.5 sm:gap-2"
        role="grid"
        aria-label="Music bingo card"
      >
        {/* Header row */}
        {["B", "I", "N", "G", "O"].map((letter) => (
          <div
            key={letter}
            className="flex h-8 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background sm:h-10 sm:text-base"
            role="columnheader"
          >
            {letter}
          </div>
        ))}

        {/* Squares */}
        {squares.map((square, index) => (
          <button
            key={square.id}
            onClick={() => toggleSquare(index)}
            disabled={index === 12}
            className={`flex aspect-square items-center justify-center rounded-lg border p-1 text-center text-[10px] font-medium leading-tight transition-all sm:text-xs ${
              square.marked
                ? "border-green-500 bg-green-500/20 text-green-700 dark:text-green-400"
                : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-foreground/5"
            } ${index === 12 ? "cursor-default" : "cursor-pointer"}`}
            role="gridcell"
            aria-label={`${square.text}${square.marked ? " (marked)" : ""}`}
          >
            {index === 12 ? (
              <Star className="h-5 w-5 text-yellow-500" aria-hidden="true" />
            ) : (
              <span className="line-clamp-3">{square.text}</span>
            )}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-sm text-muted">
          Mark squares as you complete each music challenge. Get 5 in a row
          (horizontal, vertical, or diagonal) to win!
        </p>
      </div>
    </div>
  );
}
