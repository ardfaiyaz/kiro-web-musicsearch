"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Trophy, RefreshCw, Clock } from "lucide-react";

interface MemoryCard {
  id: number;
  imageUrl: string;
  albumName: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

const MEMORY_BEST_KEY = "music-search-memory-best";

const SEARCH_TERMS = [
  "best albums 2024", "classic rock albums", "pop albums", "jazz albums",
  "hip hop albums", "indie albums", "electronic albums", "soul albums",
];

export default function MemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const totalPairs = 8;

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const termIndex = Math.floor(Math.random() * SEARCH_TERMS.length);
      const term = SEARCH_TERMS[termIndex];

      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=album&limit=30`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      const albums = data.results.filter(
        (r: { wrapperType: string; artworkUrl100?: string }) =>
          r.wrapperType === "collection" && r.artworkUrl100
      );

      if (albums.length < totalPairs) throw new Error("Not enough albums found");

      // Pick unique albums
      const selected = albums
        .sort(() => Math.random() - 0.5)
        .slice(0, totalPairs);

      // Create pairs
      const cardPairs: MemoryCard[] = [];
      selected.forEach(
        (album: { artworkUrl100: string; collectionName: string }, index: number) => {
          const imageUrl = album.artworkUrl100.replace("100x100", "200x200");
          cardPairs.push({
            id: index * 2,
            imageUrl,
            albumName: album.collectionName,
            pairId: index,
            flipped: false,
            matched: false,
          });
          cardPairs.push({
            id: index * 2 + 1,
            imageUrl,
            albumName: album.collectionName,
            pairId: index,
            flipped: false,
            matched: false,
          });
        }
      );

      // Shuffle
      const shuffled = cardPairs.sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setFlippedIndices([]);
      setMatchedPairs(0);
      setMoves(0);
      setGameWon(false);
      setStartTime(Date.now());
      setElapsed(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Timer
  useEffect(() => {
    if (loading || gameWon || cards.length === 0) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, gameWon, startTime, cards.length]);

  const handleCardClick = (index: number) => {
    if (isChecking) return;
    if (cards[index].flipped || cards[index].matched) return;
    if (flippedIndices.length >= 2) return;

    const newCards = cards.map((card, i) =>
      i === index ? { ...card, flipped: true } : card
    );
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsChecking(true);

      const [first, second] = newFlipped;
      if (newCards[first].pairId === newCards[second].pairId) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, matched: true } : card
            )
          );
          const newMatched = matchedPairs + 1;
          setMatchedPairs(newMatched);
          setFlippedIndices([]);
          setIsChecking(false);

          if (newMatched === totalPairs) {
            setGameWon(true);
            // Save best score
            try {
              const stored = localStorage.getItem(MEMORY_BEST_KEY);
              const best = stored ? JSON.parse(stored) : { moves: Infinity };
              if (moves + 1 < best.moves) {
                localStorage.setItem(
                  MEMORY_BEST_KEY,
                  JSON.stringify({ moves: moves + 1, time: elapsed })
                );
              }
            } catch {
              // ignore
            }
          }
        }, 500);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, flipped: false } : card
            )
          );
          setFlippedIndices([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16" aria-busy="true">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
        <p className="mt-4 text-muted">Loading album artwork...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg text-foreground">{error}</p>
        <button
          onClick={fetchCards}
          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </button>
      </div>
    );
  }

  if (gameWon) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <Trophy className="h-16 w-16 text-yellow-500" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-foreground">You Won!</h3>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{moves}</p>
            <p className="text-xs text-muted">Moves</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatTime(elapsed)}</p>
            <p className="text-xs text-muted">Time</p>
          </div>
        </div>
        <button
          onClick={fetchCards}
          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Stats */}
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">
            Moves: <span className="font-medium text-foreground">{moves}</span>
          </span>
          <span className="text-sm text-muted">
            Pairs: <span className="font-medium text-foreground">{matchedPairs}/{totalPairs}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Card grid */}
      <div
        className="grid w-full max-w-lg grid-cols-4 gap-2 sm:gap-3"
        role="grid"
        aria-label="Memory game board"
      >
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            disabled={card.flipped || card.matched || isChecking}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 ${
              card.matched
                ? "border-green-500 opacity-60"
                : card.flipped
                  ? "border-foreground/30"
                  : "border-border bg-card hover:border-foreground/20 hover:shadow-md"
            }`}
            aria-label={
              card.flipped || card.matched
                ? `Album: ${card.albumName}`
                : "Face-down card"
            }
          >
            {card.flipped || card.matched ? (
              <Image
                src={card.imageUrl}
                alt={card.albumName}
                fill
                sizes="(max-width: 640px) 80px, 120px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-foreground/5 to-foreground/10">
                <svg
                  className="h-6 w-6 text-muted sm:h-8 sm:w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-muted">
        Flip two cards to find matching album artwork pairs
      </p>
    </div>
  );
}
