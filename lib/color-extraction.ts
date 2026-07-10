"use client";

import { useState, useEffect } from "react";

export interface ExtractedColors {
  dominant: string;
  palette: string[];
  isDark: boolean;
}

const colorCache = new Map<string, ExtractedColors>();

/**
 * Extracts dominant colors from an image URL using canvas.
 * Returns a palette of 3-5 colors sorted by frequency.
 */
export async function extractColors(imageUrl: string): Promise<ExtractedColors> {
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Scale down for performance
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const pixels = imageData.data;

        // Quantize colors into buckets
        const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();
        const bucketSize = 32;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = Math.round(pixels[i] / bucketSize) * bucketSize;
          const g = Math.round(pixels[i + 1] / bucketSize) * bucketSize;
          const b = Math.round(pixels[i + 2] / bucketSize) * bucketSize;
          const a = pixels[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Skip very dark and very light pixels
          const brightness = (r + g + b) / 3;
          if (brightness < 20 || brightness > 240) continue;

          const key = `${r},${g},${b}`;
          const existing = colorBuckets.get(key);
          if (existing) {
            existing.r += pixels[i];
            existing.g += pixels[i + 1];
            existing.b += pixels[i + 2];
            existing.count++;
          } else {
            colorBuckets.set(key, { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2], count: 1 });
          }
        }

        // Sort by frequency and get top 5
        const sorted = Array.from(colorBuckets.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        if (sorted.length === 0) {
          const fallback: ExtractedColors = {
            dominant: "rgb(100, 100, 200)",
            palette: ["rgb(100, 100, 200)", "rgb(150, 100, 180)", "rgb(80, 120, 200)"],
            isDark: true,
          };
          colorCache.set(imageUrl, fallback);
          resolve(fallback);
          return;
        }

        const palette = sorted.map((c) => {
          const r = Math.round(c.r / c.count);
          const g = Math.round(c.g / c.count);
          const b = Math.round(c.b / c.count);
          return `rgb(${r}, ${g}, ${b})`;
        });

        const dominantColor = sorted[0];
        const dr = Math.round(dominantColor.r / dominantColor.count);
        const dg = Math.round(dominantColor.g / dominantColor.count);
        const db = Math.round(dominantColor.b / dominantColor.count);
        const isDark = (dr + dg + db) / 3 < 128;

        const result: ExtractedColors = {
          dominant: `rgb(${dr}, ${dg}, ${db})`,
          palette,
          isDark,
        };

        colorCache.set(imageUrl, result);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };

    img.src = imageUrl;
  });
}

/**
 * React hook that extracts dominant colors from an image URL.
 * Returns the extracted colors and a loading state.
 */
export function useColorExtraction(imageUrl: string | null | undefined) {
  const [state, setState] = useState<{
    colors: ExtractedColors | null;
    isLoading: boolean;
    resolvedUrl: string | null;
  }>({
    colors: null,
    isLoading: false,
    resolvedUrl: null,
  });

  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    // Skip if already resolved for this URL
    if (colorCache.has(imageUrl)) {
      return;
    }

    let cancelled = false;

    extractColors(imageUrl)
      .then((result) => {
        if (!cancelled) {
          setState({ colors: result, isLoading: false, resolvedUrl: imageUrl });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ colors: null, isLoading: false, resolvedUrl: imageUrl });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  if (!imageUrl) {
    return { colors: null, isLoading: false };
  }

  // Check cache synchronously during render (no setState needed)
  const cached = colorCache.get(imageUrl);
  if (cached) {
    return { colors: cached, isLoading: false };
  }

  // If the effect already resolved this URL
  if (state.resolvedUrl === imageUrl) {
    return { colors: state.colors, isLoading: state.isLoading };
  }

  // Still loading
  return { colors: null, isLoading: true };
}
