"use client";

import { ItunesArtist } from "@/lib/types";
import FavoriteArtistButton from "./FavoriteArtistButton";
import ShareMenu from "./ShareMenu";

interface ArtistActionsProps {
  artist: ItunesArtist;
}

export default function ArtistActions({ artist }: ArtistActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FavoriteArtistButton artist={artist} />
      <ShareMenu type="artist" artistName={artist.artistName} />
    </div>
  );
}
