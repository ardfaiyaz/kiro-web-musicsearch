"use client";

import { useRef, useState, useCallback } from "react";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { useAudioPlayer } from "../AudioPlayerContext";

export default function VolumeControl() {
  const { volume, setVolume, isMuted, toggleMute } = useAudioPlayer();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const displayVolume = isDragging ? dragValue : isMuted ? 0 : volume;

  const getVolumeIcon = useCallback(() => {
    if (isMuted || displayVolume === 0) {
      return <VolumeX className="h-4 w-4" aria-hidden="true" />;
    }
    if (displayVolume < 0.33) {
      return <Volume className="h-4 w-4" aria-hidden="true" />;
    }
    if (displayVolume < 0.66) {
      return <Volume1 className="h-4 w-4" aria-hidden="true" />;
    }
    return <Volume2 className="h-4 w-4" aria-hidden="true" />;
  }, [isMuted, displayVolume]);

  const getPositionFromEvent = useCallback((clientX: number): number => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const pos = getPositionFromEvent(e.clientX);
      setIsDragging(true);
      setDragValue(pos);

      const handleMouseMove = (ev: MouseEvent) => {
        const newPos = getPositionFromEvent(ev.clientX);
        setDragValue(newPos);
      };

      const handleMouseUp = (ev: MouseEvent) => {
        const finalPos = getPositionFromEvent(ev.clientX);
        setVolume(finalPos);
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [getPositionFromEvent, setVolume]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const pos = getPositionFromEvent(e.clientX);
      setVolume(pos);
    },
    [getPositionFromEvent, setVolume]
  );

  return (
    <div className="flex w-full max-w-sm items-center gap-3">
      <button
        onClick={toggleMute}
        className="shrink-0 rounded-full p-1 text-muted transition-colors hover:text-foreground"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {getVolumeIcon()}
      </button>

      <div
        ref={sliderRef}
        className="relative h-6 flex-1 cursor-pointer py-2 group"
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        role="slider"
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayVolume * 100)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            setVolume(Math.min(1, volume + 0.05));
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            setVolume(Math.max(0, volume - 0.05));
          }
        }}
      >
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground/10 transition-all group-hover:h-1.5">
          {/* Filled */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-foreground transition-[width] duration-75"
            style={{ width: `${displayVolume * 100}%` }}
          />
          {/* Thumb */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-foreground transition-transform ${isDragging ? "scale-125" : "scale-0 group-hover:scale-100"}`}
            style={{
              left: `${displayVolume * 100}%`,
              marginLeft: "-6px",
            }}
          />
        </div>
      </div>

      <span className="w-8 text-right text-xs tabular-nums text-muted">
        {Math.round(displayVolume * 100)}
      </span>
    </div>
  );
}
