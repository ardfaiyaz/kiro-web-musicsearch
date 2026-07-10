"use client";

interface ShimmerSkeletonProps {
  shape?: "rectangle" | "circle" | "line";
  width?: string;
  height?: string;
  className?: string;
}

export default function ShimmerSkeleton({
  shape = "rectangle",
  width,
  height,
  className = "",
}: ShimmerSkeletonProps) {
  const shapeClasses = {
    rectangle: "rounded-xl",
    circle: "rounded-full",
    line: "rounded-md",
  };

  const defaultDimensions = {
    rectangle: { width: "100%", height: "200px" },
    circle: { width: "48px", height: "48px" },
    line: { width: "100%", height: "16px" },
  };

  return (
    <div
      className={`shimmer-loading ${shapeClasses[shape]} ${className}`}
      style={{
        width: width || defaultDimensions[shape].width,
        height: height || defaultDimensions[shape].height,
      }}
      aria-hidden="true"
      role="presentation"
    />
  );
}
