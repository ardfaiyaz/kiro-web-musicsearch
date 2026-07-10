import LoadingSpinner from "./components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <LoadingSpinner message="Loading..." />
    </div>
  );
}
