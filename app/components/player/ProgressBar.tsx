"use client";

import { useRef, useState, useCallback } from "react";
import { useAudioPlayer } from "../AudioPlayerContext";
import { useDynamicColors } from "../DynamicColorProvider";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface ProgressBarProps {
  compact?: boolean;
  showTimes?: boolean;
}

export default function ProgressBar({
  compact = false,
  showTimes = true,
}: ProgressBarProps) {
  const { currentTime, duration, progress, seekTo } = useAudioPlayer();
  const { colors } = useDynamicColors();
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [dragProgress, setDragProgress] = useState(0);

  const accentColor = colors?.dominant || "var(--foreground)";

  const getPositionFromEvent = useCallback(
    (clientX: number): number => {
      if (!barRef.current) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      return Math.max(0, Math.min(1, x / rect.width));
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const pos = getPositionFromEvent(e.clientX);
      setIsDragging(true);
      setDragProgress(pos * 100);

      const handleMouseMove = (ev: MouseEvent) => {
        const newPos = getPositionFromEvent(ev.clientX);
        setDragProgress(newPos * 100);
      };

      const handleMouseUp = (ev: MouseEvent) => {
        const finalPos = getPositionFromEvent(ev.clientX);
        const time = finalPos * duration;
        seekTo(time);
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [duration, seekTo, getPositionFromEvent]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const pos = getPositionFromEvent(touch.clientX);
      setIsDragging(true);
      setDragProgress(pos * 100);

      const handleTouchMove = (ev: TouchEvent) => {
        const t = ev.touches[0];
        const newPos = getPositionFromEvent(t.clientX);
        setDragProgress(newPos * 100);
      };

      const handleTouchEnd = (ev: TouchEvent) => {
        const t = ev.changedTouches[0];
        const finalPos = getPositionFromEvent(t.clientX);
        const time = finalPos * duration;
        seekTo(time);
        setIsDragging(false);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    },
    [duration, seekTo, getPositionFromEvent]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) {
        const pos = getPositionFromEvent(e.clientX);
        setHoverPosition(pos);
      }
    },
    [isDragging, getPositionFromEvent]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  }, [isDragging]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) {
        const pos = getPositionFromEvent(e.clientX);
        const time = pos * duration;
        seekTo(time);
      }
    },
    [isDragging, duration, seekTo, getPositionFromEvent]
  );

  const displayProgress = isDragging ? dragProgress : progress;
  const hoverTime = hoverPosition !== null ? hoverPosition * duration : null;

  return (
    <div className={`w-full ${compact ? "" : "max-w-sm"}`}>
      {/* Progress bar track */}
      <div
        ref={barRef}
        className={`relative cursor-pointer ${compact ? "h-2 py-1" : "h-6 py-2"} group`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration || 100}
        aria-valuenow={currentTime}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            seekTo(Math.min(duration, currentTime + 5));
          } else if (e.key === "ArrowLeft") {
            seekTo(Math.max(0, currentTime - 5));
          }
        }}
      >
        {/* Background track */}
        <div
          className={`absolute left-0 right-0 rounded-full bg-foreground/10 ${compact ? "top-[calc(50%-1px)] h-0.5 group-hover:h-1 group-hover:top-[calc(50%-2px)]" : "top-1/2 h-1 -translate-y-1/2 group-hover:h-1.5"} transition-all duration-150`}
        >
          {/* Filled portion */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
            style={{
              width: `${displayProgress}%`,
              backgroundColor: accentColor,
            }}
          />

          {/* Thumb indicator */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-transform duration-100 ${isDragging ? "scale-150" : "scale-0 group-hover:scale-100"}`}
            style={{
              left: `${displayProgress}%`,
              width: "10px",
              height: "10px",
              marginLeft: "-5px",
              backgroundColor: accentColor,
            }}
          />
        </div>

        {/* Hover time tooltip */}
        {hoverPosition !== null && hoverTime !== null && !compact && (
          <div
            className="absolute -top-7 -translate-x-1/2 rounded-md bg-foreground px-2 py-0.5 text-[10px] font-medium text-background"
            style={{ left: `${hoverPosition * 100}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* Time display */}
      {showTimes && !compact && (
        <div className="flex justify-between text-xs text-muted">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
}
