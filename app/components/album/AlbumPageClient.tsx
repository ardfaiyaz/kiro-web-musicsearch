"use client";

import { useRef } from "react";
import type { ItunesAlbum, ItunesTrack, SpotifyAlbum } from "@/lib/types";
import AlbumHero from "./AlbumHero";
import StickyAlbumBar from "./StickyAlbumBar";
import Tracklist from "./Tracklist";
import AlbumDescription from "./AlbumDescription";

interface AlbumPageClientProps {
  album: ItunesAlbum;
  tracks: ItunesTrack[];
  spotify?: SpotifyAlbum;
  artworkUrl: string | null;
  totalDuration: string;
}

export default function AlbumPageClient({
  album,
  tracks,
  spotify,
  artworkUrl,
  totalDuration,
}: AlbumPageClientProps) {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={heroRef}>
        <AlbumHero
          album={album}
          tracks={tracks}
          spotify={spotify}
          artworkUrl={artworkUrl}
          totalDuration={totalDuration}
        />
      </div>

      <StickyAlbumBar
        album={album}
        tracks={tracks}
        spotify={spotify}
        artworkUrl={artworkUrl}
        heroRef={heroRef}
      />

      <Tracklist tracks={tracks} />

      <AlbumDescription description={null} />
    </>
  );
}
