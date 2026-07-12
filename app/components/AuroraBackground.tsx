"use client";

/**
 * AuroraBackground - Animated aurora borealis effect using multiple
 * overlapping gradient blobs with CSS animation (translate and opacity changes).
 * Used behind the hero section for a dramatic ambient effect.
 * Respects reduced motion settings.
 */
export default function AuroraBackground() {
  return (
    <div
      className="aurora-background absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Aurora blob 1 - green/teal */}
      <div className="aurora-blob aurora-blob-1" />
      {/* Aurora blob 2 - blue/purple */}
      <div className="aurora-blob aurora-blob-2" />
      {/* Aurora blob 3 - purple/pink */}
      <div className="aurora-blob aurora-blob-3" />
      {/* Aurora blob 4 - cyan */}
      <div className="aurora-blob aurora-blob-4" />
    </div>
  );
}
