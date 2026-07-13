"use client";

import { useRef, useState, useCallback } from "react";
import { Download, Share2 } from "lucide-react";
import { useToast } from "../ToastContext";

interface ShareCardProps {
  trackName: string;
  artistName: string;
  albumName?: string;
  artworkUrl?: string;
}

export default function ShareCard({
  trackName,
  artistName,
  albumName,
  artworkUrl,
}: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { show } = useToast();

  const generateCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 630;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#0f3460");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Decorative circles
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(1000, 100, 200, 0, Math.PI * 2);
    ctx.fillStyle = "#e94560";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(200, 500, 150, 0, Math.PI * 2);
    ctx.fillStyle = "#533483";
    ctx.fill();
    ctx.globalAlpha = 1;

    // Load artwork
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

        // Draw artwork with rounded corners
        const artX = 80;
        const artY = 115;
        const artSize = 400;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(artX, artY, artSize, artSize, 24);
        ctx.clip();
        ctx.drawImage(img, artX, artY, artSize, artSize);
        ctx.restore();

        // Artwork border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(artX, artY, artSize, artSize, 24);
        ctx.stroke();
      } catch {
        // Draw placeholder
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.roundRect(80, 115, 400, 400, 24);
        ctx.fill();
      }
    }

    // Track name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px -apple-system, BlinkMacSystemFont, sans-serif";
    const maxTextWidth = 600;
    const trackLines = wrapText(ctx, trackName, maxTextWidth);
    let textY = 180;
    for (const line of trackLines.slice(0, 2)) {
      ctx.fillText(line, 540, textY);
      textY += 60;
    }

    // Artist name
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "32px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(artistName, 540, textY + 20);

    // Album name
    if (albumName) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "24px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(albumName, 540, textY + 70);
    }

    // Branding
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "18px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Shared via MusicSearch", 540, 560);

    // Music note icon
    ctx.fillStyle = "rgba(233, 69, 96, 0.8)";
    ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("\u266B", 540, 510);

    setPreviewUrl(canvas.toDataURL("image/png"));
    setIsGenerating(false);
  }, [trackName, artistName, albumName, artworkUrl]);

  const downloadCard = useCallback(() => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `${trackName}-${artistName}-share.png`.replace(/\s+/g, "-").toLowerCase();
    link.href = previewUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    show("success", "Share card downloaded!");
  }, [previewUrl, trackName, artistName, show]);

  const shareCard = useCallback(async () => {
    if (!previewUrl) return;
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], "share-card.png", { type: "image/png" });

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
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Generate share card"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          {isGenerating ? "Generating..." : "Generate Share Card"}
        </button>
      )}

      {previewUrl && (
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`Share card for ${trackName} by ${artistName}`}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={downloadCard}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-card border border-border text-foreground transition-colors hover:bg-accent/10"
              aria-label="Download share card"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={shareCard}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white transition-opacity hover:opacity-90"
              aria-label="Share card"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
