"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Volume2, RefreshCw, CheckCircle, XCircle, Trophy } from "lucide-react";

interface SongQuestion {
  previewUrl: string;
  correctTitle: string;
  artistName: string;
  options: string[];
}

const GUESS_SCORE_KEY = "music-search-guess-score";

const SEARCH_TERMS = [
  "top hits 2024", "best pop songs", "rock anthems", "dance music",
  "love songs", "summer hits", "chill vibes", "party music",
  "workout music", "feel good songs",
];

export default function GuessTheSong() {
  const [questions, setQuestions] = useState<SongQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const termIndex = Math.floor(Math.random() * SEARCH_TERMS.length);
      const term = SEARCH_TERMS[termIndex];

      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=musicTrack&limit=50`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      const tracks = data.results.filter(
        (r: { wrapperType: string; previewUrl?: string }) =>
          r.wrapperType === "track" && r.previewUrl
      );

      if (tracks.length < 8) throw new Error("Not enough tracks with previews");

      const generated: SongQuestion[] = [];
      const usedTracks = new Set<string>();

      for (let i = 0; i < tracks.length && generated.length < 5; i++) {
        const track = tracks[i];
        if (usedTracks.has(track.trackName)) continue;
        usedTracks.add(track.trackName);

        const otherTitles = tracks
          .filter((t: { trackName: string }) => t.trackName !== track.trackName)
          .map((t: { trackName: string; artistName: string }) => `${t.trackName} - ${t.artistName}`);
        const uniqueOthers: string[] = [...new Set(otherTitles as string[])];

        if (uniqueOthers.length < 3) continue;

        const shuffledOthers = uniqueOthers.sort(() => Math.random() - 0.5).slice(0, 3);
        const correctOption = `${track.trackName} - ${track.artistName}`;
        const options = [...shuffledOthers, correctOption].sort(() => Math.random() - 0.5);

        generated.push({
          previewUrl: track.previewUrl,
          correctTitle: correctOption,
          artistName: track.artistName,
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
      setHasPlayed(false);
      setTimeLeft(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const playPreview = () => {
    if (isPlaying || !questions[currentIndex]) return;

    const audio = new Audio(questions[currentIndex].previewUrl);
    audioRef.current = audio;
    setIsPlaying(true);
    setHasPlayed(true);
    setTimeLeft(5);

    audio.play().catch(() => {
      setIsPlaying(false);
      setError("Could not play audio preview");
    });

    let countdown = 5;
    timerRef.current = setInterval(() => {
      countdown -= 1;
      setTimeLeft(countdown);
      if (countdown <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        audio.pause();
        setIsPlaying(false);
      }
    }, 1000);
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelected(answer);
    setShowResult(true);

    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPlaying(false);

    const isCorrect = answer === questions[currentIndex].correctTitle;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setGameOver(true);
        try {
          const best = localStorage.getItem(GUESS_SCORE_KEY);
          const bestScore = best ? JSON.parse(best).score : 0;
          if (newScore > bestScore) {
            localStorage.setItem(GUESS_SCORE_KEY, JSON.stringify({ score: newScore, total: questions.length }));
          }
        } catch {
          // ignore
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelected(null);
        setShowResult(false);
        setHasPlayed(false);
        setTimeLeft(5);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16" aria-busy="true">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
        <p className="mt-4 text-muted">Loading songs...</p>
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

  if (gameOver) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <Trophy className="h-16 w-16 text-yellow-500" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-foreground">
          {score === questions.length ? "Perfect Ear!" : "Game Over!"}
        </h3>
        <p className="text-lg text-muted">
          You guessed <span className="font-bold text-foreground">{score}</span> out of{" "}
          <span className="font-bold text-foreground">{questions.length}</span> correctly!
        </p>
        <button
          onClick={fetchQuestions}
          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Progress */}
      <div className="flex w-full items-center justify-between">
        <span className="text-sm text-muted">
          Round {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-medium text-foreground">Score: {score}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-foreground transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Play button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={playPreview}
          disabled={isPlaying}
          className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-foreground/20 bg-card text-foreground shadow-lg transition-all hover:border-foreground/40 hover:shadow-xl disabled:opacity-50 sm:h-32 sm:w-32"
          aria-label={isPlaying ? "Playing audio preview" : "Play 5 second preview"}
        >
          {isPlaying ? (
            <div className="flex flex-col items-center gap-1">
              <Volume2 className="h-8 w-8 animate-pulse" aria-hidden="true" />
              <span className="text-xs font-medium">{timeLeft}s</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Play className="h-8 w-8" aria-hidden="true" />
              <span className="text-xs font-medium">
                {hasPlayed ? "Replay" : "Play"}
              </span>
            </div>
          )}
        </button>
        <p className="text-sm text-muted">
          {hasPlayed ? "Now guess the song!" : "Tap play to hear 5 seconds"}
        </p>
      </div>

      {/* Options */}
      {hasPlayed && (
        <div className="grid w-full max-w-md grid-cols-1 gap-3" role="group" aria-label="Song choices">
          {questions[currentIndex].options.map((option) => {
            let buttonClass =
              "w-full rounded-xl border border-border bg-card p-4 text-left text-sm font-medium text-foreground transition-all hover:border-foreground/30 hover:bg-foreground/5";

            if (showResult) {
              if (option === questions[currentIndex].correctTitle) {
                buttonClass =
                  "w-full rounded-xl border-2 border-green-500 bg-green-500/10 p-4 text-left text-sm font-medium text-green-700 dark:text-green-400";
              } else if (option === selected && option !== questions[currentIndex].correctTitle) {
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
              >
                <span className="flex items-center gap-2">
                  {showResult && option === questions[currentIndex].correctTitle && (
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
                  )}
                  {showResult && option === selected && option !== questions[currentIndex].correctTitle && (
                    <XCircle className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                  )}
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
