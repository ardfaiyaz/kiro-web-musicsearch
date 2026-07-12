import Header from "@/app/components/Header";
import GuessTheSong from "@/app/components/games/GuessTheSong";

export const metadata = {
  title: "Guess The Song - Music Search & Discovery",
  description: "Listen to 5 seconds of a preview and guess the song",
};

export default function GuessPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Guess The Song
          </h1>
          <p className="mt-2 text-lg text-muted">
            Listen to 5 seconds, then pick the right answer!
          </p>
        </header>
        <GuessTheSong />
      </main>
    </div>
  );
}
