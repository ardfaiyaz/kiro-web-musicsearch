import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { AudioPlayerProvider } from "./components/AudioPlayerContext";
import { FavoritesProvider } from "./components/FavoritesContext";
import { PersonalizationProvider } from "./components/PersonalizationContext";
import { ThemeProvider } from "./components/ThemeContext";
import { DynamicColorProvider } from "./components/DynamicColorProvider";
import { SettingsProvider } from "./components/SettingsContext";
import AmbientBackground from "./components/AmbientBackground";
import MiniPlayer from "./components/MiniPlayer";
import SettingsFab from "./components/SettingsFab";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
import CommandPalette from "./components/CommandPalette";
import { ToastProvider } from "./components/ToastContext";
import OfflineDetector from "./components/OfflineDetector";
import RecentlyPlayedTracker from "./components/RecentlyPlayedTracker";
import CustomCursorWrapper from "./components/CustomCursorWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
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
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t==='system'&&!window.matchMedia('(prefers-color-scheme: light)').matches)||(!t&&!window.matchMedia('(prefers-color-scheme: light)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only fixed left-4 top-4 z-[100] rounded bg-foreground px-4 py-2 text-background focus:outline-none"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <SettingsProvider>
            <AudioPlayerProvider>
              <DynamicColorProvider>
                <FavoritesProvider>
                  <PersonalizationProvider>
                    <ToastProvider>
                      <AmbientBackground />
                      <CustomCursorWrapper />
                      <div className="relative z-10 flex min-h-full flex-col">
                        <OfflineDetector />
                        <RecentlyPlayedTracker />
                        <main id="main-content" tabIndex={-1}>
                          {children}
                        </main>
                        <MiniPlayer />
                        <SettingsFab />
                        <KeyboardShortcuts />
                        <CommandPalette />
                      </div>
                    </ToastProvider>
                  </PersonalizationProvider>
                </FavoritesProvider>
              </DynamicColorProvider>
            </AudioPlayerProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
