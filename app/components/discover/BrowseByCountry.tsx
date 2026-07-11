import Link from "next/link";
import { COUNTRY_CATEGORIES, COUNTRY_FLAGS } from "@/lib/browse-categories";

export default function BrowseByCountry() {
  return (
    <section aria-label="Browse by country" className="mb-16">
      <h3 className="mb-6 text-2xl font-bold text-foreground">
        Browse by Country
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {COUNTRY_CATEGORIES.map((country) => {
          const flag = COUNTRY_FLAGS[country.id] || "";
          return (
            <Link
              key={country.id}
              href={`/?q=${encodeURIComponent(country.searchQuery)}`}
              className={`group relative flex h-28 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${country.gradient} p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.03] glass-card sm:h-32`}
            >
              <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/20" />
              <span className="relative z-10 text-3xl" aria-hidden="true">
                {flag}
              </span>
              <span className="relative z-10 text-sm font-bold text-white drop-shadow-md sm:text-base">
                {country.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
