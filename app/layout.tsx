import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AudioPlayerProvider } from "./components/AudioPlayerContext";
import { FavoritesProvider } from "./components/FavoritesContext";
import { ThemeProvider } from "./components/ThemeContext";
import MiniPlayer from "./components/MiniPlayer";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AudioPlayerProvider>
            <FavoritesProvider>
              {children}
              <MiniPlayer />
              <KeyboardShortcuts />
            </FavoritesProvider>
          </AudioPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
