"use client";

import { useRef, useState, useCallback } from "react";
import { Download, Share2, Music } from "lucide-react";
import { useAudioPlayer } from "../AudioPlayerContext";
import { useToast } from "../ToastContext";

export default function NowPlayingCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { show } = useToast();
  const { trackName, artistName, artworkUrl, currentTime, duration, isPlaying } =
    useAudioPlayer();

  const generateCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !trackName) return;

    setIsGenerating(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 400);
    gradient.addColorStop(0, "#0f0c29");
    gradient.addColorStop(0.5, "#302b63");
    gradient.addColorStop(1, "#24243e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 400);

    // Decorative elements
    ctx.globalAlpha = 0.06;
    ctx.beginPath();
    ctx.arc(700, 50, 180, 0, Math.PI * 2);
    ctx.fillStyle = "#7c3aed";
    ctx.fill();
    ctx.globalAlpha = 1;

    // "Now Playing" badge
    ctx.fillStyle = "rgba(124, 58, 237, 0.3)";
    ctx.beginPath();
    ctx.roundRect(60, 40, 160, 36, 18);
    ctx.fill();
    ctx.fillStyle = "#c4b5fd";
    ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(isPlaying ? "\u25B6  Now Playing" : "\u23F8  Paused", 80, 64);

    // Load artwork
    if (artworkUrl) {
      try {
        const highResUrl = artworkUrl.replace("100x100", "400x400");
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = highResUrl;
        });

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(60, 100, 240, 240, 16);
        ctx.clip();
        ctx.drawImage(img, 60, 100, 240, 240);
        ctx.restore();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(60, 100, 240, 240, 16);
        ctx.stroke();
      } catch {
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.roundRect(60, 100, 240, 240, 16);
        ctx.fill();
      }
    }

    // Track info
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, sans-serif";
    const displayName = trackName.length > 25 ? trackName.slice(0, 25) + "..." : trackName;
    ctx.fillText(displayName, 340, 180);

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "24px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(artistName || "Unknown Artist", 340, 220);

    // Progress bar
    const progressX = 340;
    const progressY = 280;
    const progressWidth = 380;
    const progressHeight = 6;
    const progressPercent = duration > 0 ? currentTime / duration : 0;

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.roundRect(progressX, progressY, progressWidth, progressHeight, 3);
    ctx.fill();

    ctx.fillStyle = "#c4b5fd";
    ctx.beginPath();
    ctx.roundRect(progressX, progressY, progressWidth * progressPercent, progressHeight, 3);
    ctx.fill();

    // Time stamps
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(formatTime(currentTime), progressX, progressY + 24);
    ctx.textAlign = "right";
    ctx.fillText(formatTime(duration), progressX + progressWidth, progressY + 24);
    ctx.textAlign = "left";

    // Branding
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("MusicSearch", 340, 360);

    setPreviewUrl(canvas.toDataURL("image/png"));
    setIsGenerating(false);
  }, [trackName, artistName, artworkUrl, currentTime, duration, isPlaying]);

  const downloadCard = useCallback(() => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `now-playing-${(trackName || "track").replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = previewUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    show("success", "Now Playing card downloaded!");
  }, [previewUrl, trackName, show]);

  const shareNowPlaying = useCallback(async () => {
    if (!previewUrl) return;
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], "now-playing.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Now Playing: ${trackName} by ${artistName}`,
          files: [file],
        });
      } else {
        downloadCard();
      }
    } catch {
      downloadCard();
    }
  }, [previewUrl, trackName, artistName, downloadCard]);

  if (!trackName) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface/50 p-6 text-center">
        <Music className="h-8 w-8 text-muted" aria-hidden="true" />
        <p className="text-sm text-muted">
          Play a track to generate a Now Playing card
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {!previewUrl && (
        <button
          type="button"
          onClick={generateCard}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-violet-500 to-purple-600 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Generate Now Playing card"
        >
          <Music className="h-4 w-4" aria-hidden="true" />
          {isGenerating ? "Generating..." : "Generate Now Playing Card"}
        </button>
      )}

      {previewUrl && (
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`Now playing: ${trackName} by ${artistName}`}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={downloadCard}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-card border border-border text-foreground transition-colors hover:bg-accent/10"
              aria-label="Download Now Playing card"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </button>
            <button
              type="button"
              onClick={shareNowPlaying}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-violet-500 to-purple-600 text-white transition-opacity hover:opacity-90"
              aria-label="Share Now Playing card"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </button>
          </div>
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
