"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useColorExtraction, ExtractedColors } from "@/lib/color-extraction";
import { useAudioPlayer } from "./AudioPlayerContext";

interface DynamicColorContextType {
  colors: ExtractedColors | null;
  isLoading: boolean;
  setPageArtworkUrl: (url: string | null) => void;
}

const DynamicColorContext = createContext<DynamicColorContextType>({
  colors: null,
  isLoading: false,
  setPageArtworkUrl: () => {},
});

export function useDynamicColors() {
  return useContext(DynamicColorContext);
}

export function DynamicColorProvider({ children }: { children: ReactNode }) {
  const { artworkUrl: playerArtworkUrl } = useAudioPlayer();
  const [pageArtworkUrl, setPageArtworkUrl] = useState<string | null>(null);

  // Prioritize currently playing track artwork, then page artwork
  const activeUrl = playerArtworkUrl || pageArtworkUrl;
  const { colors, isLoading } = useColorExtraction(activeUrl);

  // Apply dynamic colors as CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    if (colors) {
      root.style.setProperty("--dynamic-accent", colors.dominant);
      root.style.setProperty(
        "--dynamic-accent-light",
        colors.palette[1] || colors.dominant
      );
      root.style.setProperty(
        "--dynamic-accent-muted",
        colors.palette[2] || colors.palette[1] || colors.dominant
      );
      root.style.setProperty(
        "--dynamic-accent-secondary",
        colors.palette[3] || colors.palette[1] || colors.dominant
      );
      // Apply a subtle full-page gradient background
      root.style.setProperty(
        "--dynamic-page-gradient",
        `radial-gradient(ellipse at 50% 0%, ${colors.dominant}10 0%, transparent 50%)`
      );
    } else {
      root.style.removeProperty("--dynamic-accent");
      root.style.removeProperty("--dynamic-accent-light");
      root.style.removeProperty("--dynamic-accent-muted");
      root.style.removeProperty("--dynamic-accent-secondary");
      root.style.removeProperty("--dynamic-page-gradient");
    }

    return () => {
      root.style.removeProperty("--dynamic-accent");
      root.style.removeProperty("--dynamic-accent-light");
      root.style.removeProperty("--dynamic-accent-muted");
      root.style.removeProperty("--dynamic-accent-secondary");
      root.style.removeProperty("--dynamic-page-gradient");
    };
  }, [colors]);

  const handleSetPageArtworkUrl = useCallback((url: string | null) => {
    setPageArtworkUrl(url);
  }, []);

  return (
    <DynamicColorContext.Provider
      value={{ colors, isLoading, setPageArtworkUrl: handleSetPageArtworkUrl }}
    >
      {children}
    </DynamicColorContext.Provider>
  );
}
