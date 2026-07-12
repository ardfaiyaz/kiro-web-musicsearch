import Header from "@/app/components/Header";
import MusicBingo from "@/app/components/games/MusicBingo";

export const metadata = {
  title: "Music Bingo - Music Search & Discovery",
  description: "Fill your music bingo card by completing listening challenges",
};

export default function BingoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Music Bingo
          </h1>
          <p className="mt-2 text-lg text-muted">
            Complete music challenges to mark your card and get BINGO!
          </p>
        </header>
        <MusicBingo />
      </main>
    </div>
  );
}
