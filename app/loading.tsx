import ShimmerSkeleton from "./components/ShimmerSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header skeleton */}
      <div className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <ShimmerSkeleton shape="line" width="80px" height="28px" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <ShimmerSkeleton
                  key={i}
                  shape="circle"
                  width="32px"
                  height="32px"
                  className="hidden sm:block"
                />
              ))}
              {Array.from({ length: 3 }).map((_, i) => (
                <ShimmerSkeleton
                  key={`mobile-${i}`}
                  shape="circle"
                  width="32px"
                  height="32px"
                  className="sm:hidden"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero section skeleton */}
        <div className="flex flex-col items-center gap-6 py-16">
          <ShimmerSkeleton shape="line" width="288px" height="48px" />
          <ShimmerSkeleton shape="line" width="384px" height="24px" className="max-w-full" />
          <ShimmerSkeleton shape="rectangle" width="100%" height="56px" className="max-w-2xl" />
        </div>

        {/* Card grid skeleton */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl">
              <ShimmerSkeleton shape="rectangle" width="100%" height="0" className="aspect-square" />
              <div className="flex flex-col gap-2 p-4">
                <ShimmerSkeleton shape="line" width="80%" height="14px" />
                <ShimmerSkeleton shape="line" width="60%" height="12px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
