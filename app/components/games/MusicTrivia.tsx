"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Trophy, RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface TriviaQuestion {
  albumArt: string;
  albumName: string;
  correctArtist: string;
  options: string[];
}

const TRIVIA_SCORE_KEY = "music-search-trivia-score";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getSavedScore(): { score: number; total: number; date: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(TRIVIA_SCORE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

function saveScore(score: number, total: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      TRIVIA_SCORE_KEY,
      JSON.stringify({ score, total, date: getTodayString() })
    );
  } catch {
    // quota exceeded
  }
}

const SEARCH_TERMS = [
  "pop hits 2024", "rock classics", "jazz favorites", "hip hop best",
  "indie music", "electronic dance", "country top", "r&b soul",
  "alternative rock", "latin pop", "metal songs", "folk music",
];

export default function MusicTrivia() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyCompleted, setDailyCompleted] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check if already played today
    const saved = getSavedScore();
    if (saved && saved.date === getTodayString()) {
      setDailyCompleted(true);
      setScore(saved.score);
      setLoading(false);
      return;
    }

    try {
      // Pick a random search term seeded by date
      const today = getTodayString();
      const seed = today.split("-").reduce((acc, val) => acc + parseInt(val), 0);
      const termIndex = seed % SEARCH_TERMS.length;
      const term = SEARCH_TERMS[termIndex];

      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=musicTrack&limit=50`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      const tracks = data.results.filter(
        (r: { wrapperType: string; artworkUrl100?: string }) =>
          r.wrapperType === "track" && r.artworkUrl100
      );

      if (tracks.length < 8) throw new Error("Not enough data for trivia");

      // Generate 5 questions
      const generated: TriviaQuestion[] = [];
      const usedAlbums = new Set<string>();

      for (let i = 0; i < tracks.length && generated.length < 5; i++) {
        const track = tracks[i];
        if (usedAlbums.has(track.collectionName)) continue;
        usedAlbums.add(track.collectionName);

        // Get 3 wrong answers from other artists
        const otherArtists = tracks
          .filter(
            (t: { artistName: string }) => t.artistName !== track.artistName
          )
          .map((t: { artistName: string }) => t.artistName);
        const uniqueOthers = [...new Set(otherArtists)];

        if (uniqueOthers.length < 3) continue;

        // Shuffle and pick 3
        const shuffled = uniqueOthers.sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [...shuffled, track.artistName].sort(() => Math.random() - 0.5);

        generated.push({
          albumArt: track.artworkUrl100.replace("100x100", "300x300"),
          albumName: track.collectionName,
          correctArtist: track.artistName,
          options,
        });
      }

      if (generated.length === 0) throw new Error("Could not generate questions");

      setQuestions(generated);
      setCurrentIndex(0);
      setScore(0);
      setSelected(null);
      setShowResult(false);
      setGameOver(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trivia");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelected(answer);
    setShowResult(true);

    const isCorrect = answer === questions[currentIndex].correctArtist;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setGameOver(true);
        saveScore(newScore, questions.length);
        setDailyCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelected(null);
        setShowResult(false);
      }
    }, 1500);
  };

  const handlePlayAgain = () => {
    setDailyCompleted(false);
    // Clear today's score to allow replay
    try {
      localStorage.removeItem(TRIVIA_SCORE_KEY);
    } catch {
      // ignore
    }
    fetchQuestions();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16" aria-busy="true">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
        <p className="mt-4 text-muted">Loading trivia questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <XCircle className="h-12 w-12 text-red-500" aria-hidden="true" />
        <p className="text-lg text-foreground">{error}</p>
        <button
          onClick={fetchQuestions}
          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </button>
      </div>
    );
  }

  if (dailyCompleted && !gameOver && questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <Trophy className="h-16 w-16 text-yellow-500" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-foreground">Daily Trivia Complete!</h3>
        <p className="text-muted">
          You scored <span className="font-bold text-foreground">{score}</span> today.
        </p>
        <button
          onClick={handlePlayAgain}
          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Play Again
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <Trophy className="h-16 w-16 text-yellow-500" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-foreground">
          {score === questions.length ? "Perfect Score!" : "Game Over!"}
        </h3>
        <p className="text-lg text-muted">
          You got <span className="font-bold text-foreground">{score}</span> out of{" "}
          <span className="font-bold text-foreground">{questions.length}</span> correct!
        </p>
        <div className="flex gap-3">
          <button
            onClick={handlePlayAgain}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Progress */}
      <div className="flex w-full items-center justify-between">
        <span className="text-sm text-muted">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-medium text-foreground">
          Score: {score}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-foreground transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Album artwork */}
      <div className="relative aspect-square w-48 overflow-hidden rounded-2xl shadow-xl sm:w-64">
        <Image
          src={question.albumArt}
          alt="Album artwork - guess the artist"
          fill
          sizes="(max-width: 640px) 192px, 256px"
          className="object-cover"
        />
      </div>

      <p className="text-center text-lg font-medium text-foreground">
        Which artist released &quot;{question.albumName}&quot;?
      </p>

      {/* Options */}
      <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Answer choices">
        {question.options.map((option) => {
          let buttonClass =
            "w-full rounded-xl border border-border bg-card p-4 text-left text-sm font-medium text-foreground transition-all hover:border-foreground/30 hover:bg-foreground/5";

          if (showResult) {
            if (option === question.correctArtist) {
              buttonClass =
                "w-full rounded-xl border-2 border-green-500 bg-green-500/10 p-4 text-left text-sm font-medium text-green-700 dark:text-green-400";
            } else if (option === selected && option !== question.correctArtist) {
              buttonClass =
                "w-full rounded-xl border-2 border-red-500 bg-red-500/10 p-4 text-left text-sm font-medium text-red-700 dark:text-red-400";
            } else {
              buttonClass =
                "w-full rounded-xl border border-border bg-card/50 p-4 text-left text-sm font-medium text-muted opacity-50";
            }
          }

          return (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
              className={buttonClass}
              aria-label={`Answer: ${option}`}
            >
              <span className="flex items-center gap-2">
                {showResult && option === question.correctArtist && (
                  <CheckCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
                )}
                {showResult && option === selected && option !== question.correctArtist && (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                )}
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
