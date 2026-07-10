import { SkeletonGrid, SkeletonText } from "./components/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SkeletonText width="w-48" className="h-6" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4">
          <SkeletonText width="w-64" className="h-8" />
          <SkeletonText width="w-full max-w-md" className="h-10 rounded-lg" />
        </div>
        <SkeletonGrid count={8} />
      </main>
    </div>
  );
}
