"use client";

import { Play, ExternalLink } from "lucide-react";
import { useAudioPlayer } from "@/app/components/AudioPlayerContext";
import FavoriteAlbumButton from "@/app/components/FavoriteAlbumButton";
import ShareMenu from "@/app/components/ShareMenu";
import type { ItunesAlbum, ItunesTrack, SpotifyAlbum } from "@/lib/types";

interface AlbumHeroActionsProps {
  album: ItunesAlbum;
  tracks: ItunesTrack[];
  spotify?: SpotifyAlbum;
}

export default function AlbumHeroActions({
  album,
  tracks,
  spotify,
}: AlbumHeroActionsProps) {
  const { play, addToQueue } = useAudioPlayer();

  const playableTrack = tracks.find((t) => t.previewUrl);

  function handlePlayAlbum() {
    if (!playableTrack?.previewUrl) return;

    // Play the first playable track
    play(playableTrack.previewUrl, playableTrack.trackId, {
      trackName: playableTrack.trackName,
      artistName: playableTrack.artistName,
      artworkUrl: playableTrack.artworkUrl100?.replace("100x100", "200x200"),
      fullTrack: playableTrack,
    });

    // Queue subsequent playable tracks
    const remaining = tracks.filter(
      (t) => t.previewUrl && t.trackId !== playableTrack.trackId
    );
    remaining.forEach((t) => addToQueue(t));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Play Album Preview */}
      {playableTrack && (
        <button
          type="button"
          onClick={handlePlayAlbum}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-all hover:bg-primary-hover hover:scale-105 hover:shadow-lg motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`Play ${album.collectionName} preview`}
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          Preview Album
        </button>
      )}

      {/* Favorite */}
      <FavoriteAlbumButton album={album} />

      {/* Share */}
      <ShareMenu
        type="album"
        artistName={album.artistName}
        albumName={album.collectionName}
        artworkUrl={album.artworkUrl100}
      />

      {/* Open Spotify */}
      {spotify?.spotifyUrl && (
        <a
          href={spotify.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-card border border-border text-muted transition-colors hover:text-foreground hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Open on Spotify"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Spotify
        </a>
      )}

      {/* Open Apple Music / iTunes */}
      {album.collectionViewUrl && (
        <a
          href={album.collectionViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-card border border-border text-muted transition-colors hover:text-foreground hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Open on Apple Music"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Apple Music
        </a>
      )}
    </div>
  );
}
