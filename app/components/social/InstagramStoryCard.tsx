"use client";

import { useRef, useState, useCallback } from "react";
import { Download, Share2, Image as ImageIcon } from "lucide-react";
import { useToast } from "../ToastContext";

interface InstagramStoryCardProps {
  trackName: string;
  artistName: string;
  albumName?: string;
  artworkUrl?: string;
}

export default function InstagramStoryCard({
  trackName,
  artistName,
  albumName,
  artworkUrl,
}: InstagramStoryCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { show } = useToast();

  const generateCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Instagram Story dimensions: 1080x1920 (9:16 ratio)
    canvas.width = 1080;
    canvas.height = 1920;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(0.3, "#764ba2");
    gradient.addColorStop(0.7, "#f093fb");
    gradient.addColorStop(1, "#f5576c");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative elements
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(900, 300, 350, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(180, 1600, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // "Now Listening" text at top
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("\u266B  Now Listening", 540, 200);

    // Artwork (large, centered)
    const artSize = 700;
    const artX = (1080 - artSize) / 2;
    const artY = 380;

    if (artworkUrl) {
      try {
        const highResUrl = artworkUrl.replace("100x100", "600x600");
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = highResUrl;
        });

        // Shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 60;
        ctx.shadowOffsetY = 20;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(artX, artY, artSize, artSize, 32);
        ctx.clip();
        ctx.drawImage(img, artX, artY, artSize, artSize);
        ctx.restore();

        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
      } catch {
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.roundRect(artX, artY, artSize, artSize, 32);
        ctx.fill();
      }
    }

    // Track name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    const truncatedName = trackName.length > 28 ? trackName.slice(0, 28) + "..." : trackName;
    ctx.fillText(truncatedName, 540, artY + artSize + 100);

    // Artist name
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "36px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(artistName, 540, artY + artSize + 160);

    // Album name
    if (albumName) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(albumName, 540, artY + artSize + 210);
    }

    // Music bars animation (static representation)
    const barsY = 1720;
    const barWidth = 8;
    const barGap = 12;
    const barCount = 20;
    const totalBarsWidth = barCount * (barWidth + barGap) - barGap;
    const barsStartX = (1080 - totalBarsWidth) / 2;

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    const barHeights = [40, 60, 30, 80, 50, 70, 35, 90, 45, 65, 55, 75, 40, 85, 50, 60, 35, 70, 45, 55];
    for (let i = 0; i < barCount; i++) {
      const height = barHeights[i];
      ctx.beginPath();
      ctx.roundRect(
        barsStartX + i * (barWidth + barGap),
        barsY - height,
        barWidth,
        height,
        4
      );
      ctx.fill();
    }

    // Branding
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "24px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("MusicSearch", 540, 1850);

    setPreviewUrl(canvas.toDataURL("image/png"));
    setIsGenerating(false);
  }, [trackName, artistName, albumName, artworkUrl]);

  const downloadCard = useCallback(() => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `instagram-story-${trackName.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = previewUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    show("success", "Instagram story card downloaded!");
  }, [previewUrl, trackName, show]);

  const shareCard = useCallback(async () => {
    if (!previewUrl) return;
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], "instagram-story.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${trackName} by ${artistName}`,
          files: [file],
        });
      } else {
        downloadCard();
      }
    } catch {
      downloadCard();
    }
  }, [previewUrl, trackName, artistName, downloadCard]);

  return (
    <div className="flex flex-col gap-4">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {!previewUrl && (
        <button
          type="button"
          onClick={generateCard}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Generate Instagram story card"
        >
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          {isGenerating ? "Generating..." : "Generate Story Card"}
        </button>
      )}

      {previewUrl && (
        <div className="flex flex-col gap-3">
          <div className="mx-auto max-h-96 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`Instagram story card for ${trackName} by ${artistName}`}
              className="h-full max-h-96 w-auto object-contain"
            />
          </div>
          <p className="text-center text-xs text-muted">
            1080 x 1920px (9:16 Instagram Story format)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={downloadCard}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-card border border-border text-foreground transition-colors hover:bg-accent/10"
              aria-label="Download Instagram story card"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </button>
            <button
              type="button"
              onClick={shareCard}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white transition-opacity hover:opacity-90"
              aria-label="Share Instagram story card"
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
