export interface BrowseCategory {
  id: string;
  name: string;
  gradient: string;
  searchQuery: string;
  icon: string;
}

export const MOOD_CATEGORIES: BrowseCategory[] = [
  {
    id: "happy",
    name: "Happy",
    gradient: "from-yellow-400 to-orange-400",
    searchQuery: "happy pop upbeat",
    icon: "Sun",
  },
  {
    id: "sad",
    name: "Sad",
    gradient: "from-blue-400 to-indigo-500",
    searchQuery: "sad melancholy ballad",
    icon: "CloudRain",
  },
  {
    id: "energetic",
    name: "Energetic",
    gradient: "from-red-500 to-pink-500",
    searchQuery: "energetic pump anthem",
    icon: "Zap",
  },
  {
    id: "calm",
    name: "Calm",
    gradient: "from-green-400 to-teal-400",
    searchQuery: "calm relaxing ambient",
    icon: "Leaf",
  },
  {
    id: "romantic",
    name: "Romantic",
    gradient: "from-pink-400 to-rose-500",
    searchQuery: "romantic love songs",
    icon: "Heart",
  },
  {
    id: "melancholic",
    name: "Melancholic",
    gradient: "from-slate-500 to-blue-600",
    searchQuery: "melancholic indie folk",
    icon: "Moon",
  },
  {
    id: "upbeat",
    name: "Upbeat",
    gradient: "from-amber-400 to-yellow-500",
    searchQuery: "upbeat dance pop",
    icon: "ArrowUpCircle",
  },
  {
    id: "dark",
    name: "Dark",
    gradient: "from-gray-700 to-gray-900",
    searchQuery: "dark electronic gothic",
    icon: "Eclipse",
  },
];

export const DECADE_CATEGORIES: BrowseCategory[] = [
  {
    id: "2020s",
    name: "2020s",
    gradient: "from-violet-500 to-purple-600",
    searchQuery: "2024 new music hits",
    icon: "Sparkles",
  },
  {
    id: "2010s",
    name: "2010s",
    gradient: "from-blue-500 to-cyan-500",
    searchQuery: "2010s pop hits",
    icon: "Smartphone",
  },
  {
    id: "2000s",
    name: "2000s",
    gradient: "from-green-500 to-emerald-500",
    searchQuery: "2000s music hits",
    icon: "Disc3",
  },
  {
    id: "1990s",
    name: "1990s",
    gradient: "from-orange-500 to-red-500",
    searchQuery: "90s music hits",
    icon: "Radio",
  },
  {
    id: "1980s",
    name: "1980s",
    gradient: "from-pink-500 to-fuchsia-500",
    searchQuery: "80s music synthwave",
    icon: "Music",
  },
  {
    id: "1970s",
    name: "1970s",
    gradient: "from-amber-500 to-orange-600",
    searchQuery: "70s rock disco",
    icon: "Disc",
  },
  {
    id: "1960s",
    name: "1960s",
    gradient: "from-yellow-500 to-amber-600",
    searchQuery: "60s rock classic",
    icon: "Mic2",
  },
  {
    id: "1950s",
    name: "1950s",
    gradient: "from-slate-500 to-gray-600",
    searchQuery: "50s rock and roll oldies",
    icon: "Mic",
  },
];

export const COUNTRY_CATEGORIES: BrowseCategory[] = [
  {
    id: "us",
    name: "United States",
    gradient: "from-blue-600 to-red-500",
    searchQuery: "american pop hits",
    icon: "Flag",
  },
  {
    id: "uk",
    name: "United Kingdom",
    gradient: "from-red-600 to-blue-700",
    searchQuery: "british pop rock",
    icon: "Flag",
  },
  {
    id: "japan",
    name: "Japan",
    gradient: "from-rose-400 to-red-500",
    searchQuery: "j-pop japanese music",
    icon: "Flag",
  },
  {
    id: "korea",
    name: "South Korea",
    gradient: "from-blue-400 to-indigo-600",
    searchQuery: "k-pop korean music",
    icon: "Flag",
  },
  {
    id: "latin",
    name: "Latin America",
    gradient: "from-green-500 to-yellow-500",
    searchQuery: "latin reggaeton music",
    icon: "Flag",
  },
  {
    id: "africa",
    name: "Africa",
    gradient: "from-amber-500 to-green-600",
    searchQuery: "afrobeats african music",
    icon: "Flag",
  },
  {
    id: "india",
    name: "India",
    gradient: "from-orange-500 to-green-500",
    searchQuery: "bollywood indian music",
    icon: "Flag",
  },
  {
    id: "france",
    name: "France",
    gradient: "from-blue-500 to-red-400",
    searchQuery: "french pop chanson",
    icon: "Flag",
  },
];

export const ACTIVITY_CATEGORIES: BrowseCategory[] = [
  {
    id: "workout",
    name: "Workout",
    gradient: "from-orange-500 to-red-600",
    searchQuery: "workout motivation gym",
    icon: "Dumbbell",
  },
  {
    id: "study",
    name: "Study",
    gradient: "from-indigo-400 to-purple-500",
    searchQuery: "study focus concentration",
    icon: "BookOpen",
  },
  {
    id: "sleep",
    name: "Sleep",
    gradient: "from-slate-500 to-blue-700",
    searchQuery: "sleep relaxing calm ambient",
    icon: "Moon",
  },
  {
    id: "commute",
    name: "Commute",
    gradient: "from-cyan-500 to-blue-500",
    searchQuery: "commute drive playlist",
    icon: "Train",
  },
  {
    id: "cooking",
    name: "Cooking",
    gradient: "from-yellow-400 to-orange-500",
    searchQuery: "cooking jazz bossa nova",
    icon: "ChefHat",
  },
  {
    id: "gaming",
    name: "Gaming",
    gradient: "from-purple-500 to-pink-500",
    searchQuery: "gaming electronic epic",
    icon: "Gamepad2",
  },
  {
    id: "meditation",
    name: "Meditation",
    gradient: "from-teal-400 to-green-500",
    searchQuery: "meditation ambient mindful",
    icon: "Wind",
  },
];

export const THEME_CATEGORIES: BrowseCategory[] = [
  {
    id: "summer",
    name: "Summer",
    gradient: "from-yellow-400 to-orange-400",
    searchQuery: "summer vibes beach",
    icon: "Sun",
  },
  {
    id: "winter",
    name: "Winter",
    gradient: "from-blue-200 to-cyan-400",
    searchQuery: "winter cozy holiday",
    icon: "Snowflake",
  },
  {
    id: "road-trip",
    name: "Road Trip",
    gradient: "from-green-500 to-teal-500",
    searchQuery: "road trip driving adventure",
    icon: "Car",
  },
  {
    id: "party",
    name: "Party",
    gradient: "from-fuchsia-500 to-violet-500",
    searchQuery: "party dance club hits",
    icon: "PartyPopper",
  },
  {
    id: "breakup",
    name: "Breakup",
    gradient: "from-rose-500 to-red-600",
    searchQuery: "breakup heartbreak songs",
    icon: "HeartCrack",
  },
  {
    id: "nostalgia",
    name: "Nostalgia",
    gradient: "from-amber-400 to-yellow-600",
    searchQuery: "nostalgia throwback classic",
    icon: "Rewind",
  },
];

export const COUNTRY_FLAGS: Record<string, string> = {
  us: "\uD83C\uDDFA\uD83C\uDDF8",
  uk: "\uD83C\uDDEC\uD83C\uDDE7",
  japan: "\uD83C\uDDEF\uD83C\uDDF5",
  korea: "\uD83C\uDDF0\uD83C\uDDF7",
  latin: "\uD83C\uDDF2\uD83C\uDDFD",
  africa: "\uD83C\uDDF3\uD83C\uDDEC",
  india: "\uD83C\uDDEE\uD83C\uDDF3",
  france: "\uD83C\uDDEB\uD83C\uDDF7",
};
