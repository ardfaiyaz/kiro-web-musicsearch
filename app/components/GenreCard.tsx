import Link from "next/link";

interface GenreCardProps {
  name: string;
  gradient: string;
  description?: string;
  large?: boolean;
}

export default function GenreCard({
  name,
  gradient,
  description,
  large = false,
}: GenreCardProps) {
  const searchTerm = name.replace(/[&/]/g, " ").trim();

  return (
    <Link
      href={`/search?q=${encodeURIComponent(searchTerm)}&genre=${encodeURIComponent(name)}`}
      className={`group relative flex w-full items-end overflow-hidden rounded-xl bg-gradient-to-br ${gradient} ${large ? "h-36 sm:h-40" : "h-28 sm:h-32"} p-4 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.03] glass-card`}
    >
      <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/20" />
      <div className="relative z-10 flex flex-col gap-1">
        <span
          className={`font-bold text-white drop-shadow-md ${large ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}
        >
          {name}
        </span>
        {description && (
          <span className="text-xs text-white/80 drop-shadow-sm">
            {description}
          </span>
        )}
      </div>
    </Link>
  );
}
