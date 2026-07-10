"use client";

import { ItunesAlbum } from "@/lib/types";
import FavoriteAlbumButton from "./FavoriteAlbumButton";
import ShareMenu from "./ShareMenu";

interface AlbumActionsProps {
  album: ItunesAlbum;
}

export default function AlbumActions({ album }: AlbumActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FavoriteAlbumButton album={album} />
      <ShareMenu
        type="album"
        artistName={album.artistName}
        albumName={album.collectionName}
        artworkUrl={album.artworkUrl100}
      />
    </div>
  );
}
