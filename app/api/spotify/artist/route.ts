import { NextRequest, NextResponse } from "next/server";
import { searchSpotifyArtist, getSpotifyArtistDetails } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "name query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const artist = await searchSpotifyArtist(name);

    if (!artist) {
      return NextResponse.json({ artist: null });
    }

    const details = await getSpotifyArtistDetails(artist.id);

    return NextResponse.json(
      { artist: details ?? artist },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Spotify artist data" },
      { status: 500 }
    );
  }
}
