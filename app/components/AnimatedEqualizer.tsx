"use client";

import { useSettings } from "./SettingsContext";

interface AnimatedEqualizerProps {
  className?: string;
}

export default function AnimatedEqualizer({
  className = "",
}: AnimatedEqualizerProps) {
  const { settings } = useSettings();
  const reducedMotion = settings.reducedMotion;

  const bars = [
    { animation: "equalizerBar1", duration: "0.5s", delay: "0s" },
    { animation: "equalizerBar2", duration: "0.7s", delay: "0.1s" },
    { animation: "equalizerBar3", duration: "0.4s", delay: "0.2s" },
    { animation: "equalizerBar4", duration: "0.6s", delay: "0.05s" },
  ];

  return (
    <div
      className={`flex items-end gap-[2px] ${className}`}
      style={{ height: "14px", width: "18px" }}
      aria-label="Now playing"
      role="img"
    >
      {bars.map((bar, index) => (
        <div
          key={index}
          className="w-[3px] rounded-full"
          style={{
            backgroundColor: "var(--dynamic-accent, var(--foreground))",
            height: reducedMotion ? "60%" : undefined,
            animation: reducedMotion
              ? "none"
              : `${bar.animation} ${bar.duration} ease-in-out ${bar.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
