import Header from "@/app/components/Header";
import MusicTrivia from "@/app/components/games/MusicTrivia";

export const metadata = {
  title: "Music Trivia - Music Search & Discovery",
  description: "Test your music knowledge with daily trivia questions",
};

export default function TriviaPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Music Trivia
          </h1>
          <p className="mt-2 text-lg text-muted">
            Which artist released this album? Test your knowledge daily!
          </p>
        </header>
        <MusicTrivia />
      </main>
    </div>
  );
}
