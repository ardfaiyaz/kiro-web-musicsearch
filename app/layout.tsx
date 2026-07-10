import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AudioPlayerProvider } from "./components/AudioPlayerContext";
import { FavoritesProvider } from "./components/FavoritesContext";
import { PersonalizationProvider } from "./components/PersonalizationContext";
import { ThemeProvider } from "./components/ThemeContext";
import { DynamicColorProvider } from "./components/DynamicColorProvider";
import AmbientBackground from "./components/AmbientBackground";
import MiniPlayer from "./components/MiniPlayer";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
import OfflineDetector from "./components/OfflineDetector";
import RecentlyPlayedTracker from "./components/RecentlyPlayedTracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music Search & Discovery",
  description:
    "Search songs, artists, and albums. Play previews and discover new music.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&!window.matchMedia('(prefers-color-scheme: light)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <AudioPlayerProvider>
            <DynamicColorProvider>
              <FavoritesProvider>
                <PersonalizationProvider>
                  <AmbientBackground />
                  <div className="relative z-10 flex min-h-full flex-col">
                    <OfflineDetector />
                    <RecentlyPlayedTracker />
                    {children}
                    <MiniPlayer />
                    <KeyboardShortcuts />
                  </div>
                </PersonalizationProvider>
              </FavoritesProvider>
            </DynamicColorProvider>
          </AudioPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
