"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface TrackData {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string | null;
  collectionName: string;
}

function EmbedPlayerContent() {
  const searchParams = useSearchParams();
  const trackId = searchParams.get("trackId");
  const [track, setTrack] = useState<TrackData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!trackId) {
      setError("No track ID provided");
      setIsLoading(false);
      return;
    }

    async function fetchTrack() {
      try {
        const response = await fetch(
          `https://itunes.apple.com/lookup?id=${trackId}`
        );
        if (!response.ok) throw new Error("Failed to fetch track");
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setTrack(data.results[0]);
        } else {
          setError("Track not found");
        }
      } catch {
        setError("Failed to load track");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrack();
  }, [trackId]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !track?.previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, track?.previewUrl]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    audioRef.current.currentTime = percent * duration;
  }, [duration]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1a2e]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1a2e] p-4">
        <p className="text-sm text-white/60">{error || "Track not found"}</p>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const artworkHighRes = track.artworkUrl100?.replace("100x100", "200x200");

  return (
    <div className="flex h-screen items-center justify-center bg-[#1a1a2e] p-3">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-white/5 p-3 backdrop-blur-sm border border-white/10">
        {/* Artwork */}
        {artworkHighRes && (
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artworkHighRes}
              alt={`${track.trackName} artwork`}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Track info & controls */}
        <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {track.trackName}
              </p>
              <p className="truncate text-xs text-white/60">
                {track.artistName}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {track.previewUrl && (
                <>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="rounded-lg p-1.5 text-white/60 transition-colors hover:text-white"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1a1a2e] transition-transform hover:scale-105"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {track.previewUrl && (
            <div
              className="h-1 w-full cursor-pointer rounded-full bg-white/10"
              onClick={handleSeek}
              role="slider"
              aria-label="Seek position"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              tabIndex={0}
            >
              <div
                className="h-full rounded-full bg-white/60 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Audio element */}
        {track.previewUrl && (
          <audio
            ref={audioRef}
            src={track.previewUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            preload="metadata"
          />
        )}
      </div>
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#1a1a2e]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      }
    >
      <EmbedPlayerContent />
    </Suspense>
  );
}
