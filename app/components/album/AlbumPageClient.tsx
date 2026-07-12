"use client";

import { useRef } from "react";
import type { ItunesAlbum, ItunesTrack, SpotifyAlbum } from "@/lib/types";
import AlbumHero from "./AlbumHero";
import StickyAlbumBar from "./StickyAlbumBar";
import Tracklist from "./Tracklist";
import AlbumDescription from "./AlbumDescription";
import AlbumAutoPlay from "./AlbumAutoPlay";

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

      {/* Auto-play all previews button */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <AlbumAutoPlay tracks={tracks} albumName={album.collectionName} />
      </div>

      <Tracklist tracks={tracks} />

      <AlbumDescription description={null} />
    </>
  );
}
