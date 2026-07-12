"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface BlurUpImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
}

/**
 * BlurUpImage shows a blurred low-res version of the image first,
 * then progressively loads the full resolution image. Uses CSS blur
 * filter on a tiny placeholder that fades out once the full image loads.
 */
export default function BlurUpImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className = "",
  priority = false,
  quality,
}: BlurUpImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  // Generate a tiny thumbnail URL for blur placeholder
  // For iTunes images, we can request a smaller size
  const getTinyUrl = (url: string): string => {
    // Replace size patterns like 100x100, 200x200 etc. with 10x10 for tiny blur
    return url.replace(/\d+x\d+/, "30x30");
  };

  const tinyUrl = getTinyUrl(src);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-surface ${className}`}
        style={!fill ? { width, height } : undefined}
        aria-label={alt}
      >
        <svg
          className="h-6 w-6 text-muted"
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
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={!fill ? { width, height } : undefined}
    >
      {/* Tiny blurred placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 z-10 scale-110"
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tinyUrl}
            alt=""
            className="h-full w-full object-cover blur-lg"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Full resolution image */}
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          className={`object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 100}
          height={height || 100}
          sizes={sizes}
          quality={quality}
          priority={priority}
          className={`object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}
