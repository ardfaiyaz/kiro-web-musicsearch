import Header from "@/app/components/Header";
import MemoryGame from "@/app/components/games/MemoryGame";

export const metadata = {
  title: "Music Memory Game - Music Search & Discovery",
  description: "Match album artworks in this card-flip memory game",
};

export default function MemoryPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Music Memory
          </h1>
          <p className="mt-2 text-lg text-muted">
            Match the album artwork pairs to win!
          </p>
        </header>
        <MemoryGame />
      </main>
    </div>
  );
}
