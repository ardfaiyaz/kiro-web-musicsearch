import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { searchTracks, searchArtists, searchAlbums } from "@/lib/itunes";
import { ItunesTrack, ItunesArtist, ItunesAlbum } from "@/lib/types";
import { Music, Users, Disc3 } from "lucide-react";

interface GenreInfo {
  name: string;
  description: string;
  history: string;
  subgenres: string[];
  gradient: string;
}

const GENRE_DATA: Record<string, GenreInfo> = {
  pop: {
    name: "Pop",
    description: "Accessible, catchy music that dominates the charts worldwide.",
    history: "Pop music evolved from rock and roll in the 1950s and 1960s. The term 'pop' refers to music that is commercially oriented, designed for broad appeal. From the Beatles and Motown to modern artists like Taylor Swift and Billie Eilish, pop continually reinvents itself while remaining the most popular genre globally.",
    subgenres: ["Synth-pop", "Dance-pop", "Electropop", "Teen pop", "Art pop", "Indie pop", "K-pop", "J-pop"],
    gradient: "from-pink-500 to-rose-500",
  },
  rock: {
    name: "Rock",
    description: "Guitar-driven music with powerful rhythms and emotional intensity.",
    history: "Rock music originated in the United States in the late 1940s and early 1950s, evolving from African-American musical genres such as blues, jazz, and gospel music. The genre exploded in the 1960s with bands like The Beatles and The Rolling Stones, and has since spawned countless subgenres from punk to progressive rock.",
    subgenres: ["Classic rock", "Punk rock", "Alternative rock", "Progressive rock", "Hard rock", "Indie rock", "Post-punk", "Grunge"],
    gradient: "from-red-600 to-orange-500",
  },
  "hip-hop-rap": {
    name: "Hip-Hop/Rap",
    description: "Rhythmic music featuring rapping, beatboxing, and sampling.",
    history: "Hip-hop emerged in the Bronx, New York City in the 1970s, born from block parties where DJs isolated percussion breaks. Artists like Grandmaster Flash and Afrika Bambaataa pioneered the genre, which grew from underground culture to become one of the most dominant and influential musical genres worldwide.",
    subgenres: ["Trap", "Conscious rap", "Boom bap", "Gangsta rap", "Mumble rap", "Lo-fi hip-hop", "Drill", "Cloud rap"],
    gradient: "from-purple-600 to-indigo-500",
  },
  electronic: {
    name: "Electronic",
    description: "Music produced primarily with electronic instruments and technology.",
    history: "Electronic music traces its roots to experimental composers in the mid-20th century who used early synthesizers and tape machines. The genre expanded massively in the 1980s and 1990s with house music in Chicago, techno in Detroit, and the rave culture of Europe, evolving into today's diverse electronic landscape.",
    subgenres: ["House", "Techno", "Drum and bass", "Dubstep", "Ambient", "Trance", "IDM", "Synthwave"],
    gradient: "from-cyan-500 to-blue-500",
  },
  jazz: {
    name: "Jazz",
    description: "Improvisational music with complex harmonies and swing rhythms.",
    history: "Jazz originated in the African-American communities of New Orleans in the late 19th and early 20th centuries. Blending African rhythms, blues, and European harmonies, jazz quickly spread across America. Icons like Louis Armstrong, Duke Ellington, Miles Davis, and John Coltrane pushed the boundaries of musical expression.",
    subgenres: ["Bebop", "Cool jazz", "Fusion", "Free jazz", "Smooth jazz", "Swing", "Modal jazz", "Latin jazz"],
    gradient: "from-amber-500 to-yellow-500",
  },
  classical: {
    name: "Classical",
    description: "Western art music rooted in centuries of composition tradition.",
    history: "Classical music spans over a thousand years, from medieval chants to contemporary orchestral works. The Western classical tradition encompasses the Baroque period (Bach, Vivaldi), Classical era (Mozart, Beethoven), Romantic period (Chopin, Wagner), and modern classical (Stravinsky, Glass), each bringing new forms of musical expression.",
    subgenres: ["Baroque", "Romantic", "Contemporary classical", "Opera", "Chamber music", "Orchestral", "Minimalism", "Neo-classical"],
    gradient: "from-slate-600 to-slate-400",
  },
  country: {
    name: "Country",
    description: "Storytelling music with roots in American folk and Western traditions.",
    history: "Country music originated in the rural Southern United States in the 1920s, drawing from folk, blues, and gospel traditions. From the honky-tonk sounds of Hank Williams to the pop-country crossover of modern artists, the genre celebrates storytelling, heartland values, and authentic musical expression.",
    subgenres: ["Country pop", "Outlaw country", "Bluegrass", "Americana", "Country rock", "Nashville sound", "Bro-country", "Alt-country"],
    gradient: "from-orange-500 to-amber-400",
  },
  "r-and-b-soul": {
    name: "R&B/Soul",
    description: "Emotional vocal music combining rhythm, blues, and gospel influences.",
    history: "R&B originated in African-American communities in the 1940s, combining jazz, gospel, and blues. Soul music emerged in the 1950s and 1960s with artists like Ray Charles, Aretha Franklin, and Sam Cooke. Modern R&B has evolved to incorporate hip-hop, electronic, and pop elements while maintaining its emotional core.",
    subgenres: ["Neo-soul", "Contemporary R&B", "Quiet storm", "Funk", "New jack swing", "Alternative R&B", "PBR&B", "Gospel"],
    gradient: "from-violet-600 to-purple-500",
  },
  latin: {
    name: "Latin",
    description: "Diverse musical traditions from Latin America and the Caribbean.",
    history: "Latin music encompasses a vast array of styles from across Latin America and the Caribbean. From the salsa and son of Cuba to Brazilian bossa nova and samba, Argentine tango, and modern reggaeton, Latin music represents centuries of cultural fusion between indigenous, African, and European musical traditions.",
    subgenres: ["Reggaeton", "Salsa", "Bachata", "Bossa nova", "Cumbia", "Merengue", "Latin pop", "Mariachi"],
    gradient: "from-green-500 to-emerald-400",
  },
  alternative: {
    name: "Alternative",
    description: "Genre-bending music that pushes against mainstream conventions.",
    history: "Alternative music emerged in the 1980s as an umbrella term for underground music that did not fit into mainstream categories. Growing out of punk, post-punk, and new wave, alternative rock broke into the mainstream in the early 1990s with Nirvana and the grunge movement, and continues to evolve as artists challenge musical norms.",
    subgenres: ["Shoegaze", "Britpop", "Post-rock", "Math rock", "Dream pop", "Noise rock", "Emo", "Midwest emo"],
    gradient: "from-teal-500 to-cyan-400",
  },
  indie: {
    name: "Indie",
    description: "Independent music spanning many styles, united by DIY spirit.",
    history: "Indie music originated from independent record labels in the 1980s, representing artists who operated outside the major label system. While originally associated with guitar-based alternative rock, indie now encompasses a wide range of styles from folk to electronic, all sharing an ethos of artistic independence and authenticity.",
    subgenres: ["Indie rock", "Indie folk", "Indie pop", "Lo-fi", "Bedroom pop", "Indie electronic", "Twee pop", "Slowcore"],
    gradient: "from-rose-400 to-pink-400",
  },
  metal: {
    name: "Metal",
    description: "Heavy, powerful music with distorted guitars and intense performances.",
    history: "Heavy metal emerged in the late 1960s and early 1970s with bands like Black Sabbath, Led Zeppelin, and Deep Purple. Characterized by loud, distorted guitars, dense bass-and-drums sound, and powerful vocals, metal has spawned numerous subgenres, each pushing the boundaries of heaviness and technical skill.",
    subgenres: ["Thrash metal", "Death metal", "Black metal", "Power metal", "Doom metal", "Progressive metal", "Nu metal", "Metalcore"],
    gradient: "from-gray-800 to-gray-600",
  },
};

export default async function GenrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const genreInfo = GENRE_DATA[id];

  if (!genreInfo) {
    return (
      <div className="flex flex-1 flex-col">
        <Header showBack />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Genre not found</h1>
            <p className="mt-2 text-muted">The genre you are looking for does not exist.</p>
            <Link href="/discover" className="mt-4 inline-block text-sm text-primary hover:underline">
              Back to Discover
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Fetch genre content from iTunes
  const [tracks, artists, albums] = await Promise.all([
    searchTracks(genreInfo.name).catch((): ItunesTrack[] => []),
    searchArtists(genreInfo.name).catch((): ItunesArtist[] => []),
    searchAlbums(`${genreInfo.name} essentials`).catch((): ItunesAlbum[] => []),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />

      {/* Hero Banner */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${genreInfo.gradient} py-16 sm:py-20 lg:py-24`}
        aria-label={`${genreInfo.name} genre page`}
      >
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            {genreInfo.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            {genreInfo.description}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Genre History */}
        <section aria-label="Genre history" className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-foreground">History</h2>
          <p className="max-w-3xl text-base leading-relaxed text-muted">
            {genreInfo.history}
          </p>
        </section>

        {/* Sub-genres */}
        <section aria-label="Sub-genres" className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Sub-genres</h2>
          <div className="flex flex-wrap gap-3">
            {genreInfo.subgenres.map((subgenre) => (
              <Link
                key={subgenre}
                href={`/search?q=${encodeURIComponent(subgenre)}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/20 hover:bg-foreground/5"
              >
                {subgenre}
              </Link>
            ))}
          </div>
        </section>

        {/* Top Artists */}
        {artists.length > 0 && (
          <section aria-label="Top artists" className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Users size={20} className="text-muted" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-foreground">Top Artists</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {artists.slice(0, 12).map((artist) => (
                <Link
                  key={artist.artistId}
                  href={`/artist/${artist.artistId}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl glass-card p-4 transition-premium hover:border-foreground/10 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-border shadow-md sm:h-24 sm:w-24">
                    {artist.artworkUrl100 ? (
                      <Image
                        src={artist.artworkUrl100.replace("100x100", "200x200")}
                        alt={artist.artistName}
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-surface">
                        <Users size={24} className="text-muted" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <span className="truncate text-center text-xs font-medium text-foreground sm:text-sm">
                    {artist.artistName}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Essential Albums */}
        {albums.length > 0 && (
          <section aria-label="Essential albums" className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Disc3 size={20} className="text-muted" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-foreground">Essential Albums</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {albums.slice(0, 10).map((album) => (
                <Link
                  key={album.collectionId}
                  href={`/album/${album.collectionId}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-border">
                    {album.artworkUrl100 ? (
                      <Image
                        src={album.artworkUrl100.replace("100x100", "300x300")}
                        alt={`${album.collectionName} artwork`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Disc3 size={24} className="text-muted" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <h4 className="truncate text-sm font-semibold text-foreground">
                      {album.collectionName}
                    </h4>
                    <p className="truncate text-xs text-muted">
                      {album.artistName}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top Tracks */}
        {tracks.length > 0 && (
          <section aria-label="Top tracks" className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Music size={20} className="text-muted" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-foreground">Popular Tracks</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tracks.slice(0, 12).map((track, index) => (
                <Link
                  key={track.trackId}
                  href={`/track/${track.trackId}`}
                  className="group flex items-center gap-3 rounded-xl glass-card p-3 transition-premium hover:border-foreground/10 hover:shadow-md"
                >
                  <span className="w-6 text-right text-xs font-medium text-muted">
                    {index + 1}
                  </span>
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-border">
                    {track.artworkUrl100 && (
                      <Image
                        src={track.artworkUrl100}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-foreground">
                      {track.trackName}
                    </span>
                    <span className="truncate text-xs text-muted">
                      {track.artistName}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
