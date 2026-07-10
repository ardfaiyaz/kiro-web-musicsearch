import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
      <div className="animate-slide-up">
        <p className="text-8xl font-bold text-foreground sm:text-9xl">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Page Not Found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-2xl bg-foreground px-8 py-3.5 font-medium text-background transition-colors hover:bg-foreground/80"
      >
        Go Home
      </Link>
    </div>
  );
}
