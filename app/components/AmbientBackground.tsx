"use client";

import { useDynamicColors } from "./DynamicColorProvider";

interface AmbientBackgroundProps {
  colors?: {
    dominant: string;
    palette: string[];
  } | null;
}

export default function AmbientBackground({ colors: propColors }: AmbientBackgroundProps) {
  const { colors: contextColors } = useDynamicColors();
  const colors = propColors || contextColors;

  const color1 = colors?.dominant || "rgba(100, 100, 200, 0.15)";
  const color2 = colors?.palette?.[1] || "rgba(200, 100, 150, 0.12)";
  const color3 = colors?.palette?.[2] || "rgba(100, 200, 180, 0.10)";

  return (
    <div
      className="ambient-background"
      aria-hidden="true"
    >
      {/* Animated gradient mesh - slow-moving layers behind glass panels */}
      <div className="ambient-gradient-mesh">
        <div className="ambient-mesh-layer ambient-mesh-layer-1" />
        <div className="ambient-mesh-layer ambient-mesh-layer-2" />
        <div className="ambient-mesh-layer ambient-mesh-layer-3" />
      </div>

      {/* Animated gradient layer */}
      <div
        className="ambient-gradient-layer"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, ${color1}, transparent 60%),
            radial-gradient(ellipse at 80% 80%, ${color2}, transparent 60%),
            radial-gradient(ellipse at 50% 50%, ${color3}, transparent 70%)
          `,
        }}
      />

      {/* Floating shapes */}
      <div className="ambient-floating-shapes">
        <div
          className="ambient-shape ambient-shape-1"
          style={{ backgroundColor: color1 }}
        />
        <div
          className="ambient-shape ambient-shape-2"
          style={{ backgroundColor: color2 }}
        />
        <div
          className="ambient-shape ambient-shape-3"
          style={{ backgroundColor: color3 }}
        />
      </div>

      {/* Film grain overlay */}
      <div className="ambient-film-grain" />

      {/* Vignette overlay */}
      <div className="ambient-vignette" />
    </div>
  );
}
