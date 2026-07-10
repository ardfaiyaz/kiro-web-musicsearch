import Link from "next/link";

interface GenreCardProps {
  name: string;
  gradient: string;
}

export default function GenreCard({ name, gradient }: GenreCardProps) {
  const searchTerm = name.replace(/[&/]/g, " ").trim();

  return (
    <Link
      href={`/?q=${encodeURIComponent(searchTerm)}&genre=${encodeURIComponent(name)}`}
      className={`group relative flex h-28 w-full items-end overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-4 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.03] sm:h-32`}
    >
      <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/20" />
      <span className="relative z-10 text-sm font-bold text-white drop-shadow-md sm:text-base">
        {name}
      </span>
    </Link>
  );
}
