import { Sparkles } from "lucide-react";

interface AIInsightsProps {
  albumName: string;
  artistName: string;
  genre: string;
}

export default function AIInsights({
  artistName,
  genre,
}: AIInsightsProps) {
  // Architecture placeholder for future AI integration
  const insights = [
    `This album showcases ${artistName}'s work in the ${genre} genre.`,
    `Fans of this release often explore similar ${genre} albums.`,
    `Discover more from ${artistName} to understand their creative evolution.`,
  ];

  return (
    <section
      aria-label="AI insights"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Insights
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          Beta
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="glass-light rounded-2xl p-5"
          >
            <p className="text-sm leading-relaxed text-muted">{insight}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
