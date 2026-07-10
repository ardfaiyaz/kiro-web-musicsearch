export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20" role="status" aria-label={message}>
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
