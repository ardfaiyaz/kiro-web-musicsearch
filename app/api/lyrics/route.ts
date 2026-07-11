import { NextRequest, NextResponse } from "next/server";
import { getLyrics } from "@/lib/lyrics";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist = searchParams.get("artist");
  const track = searchParams.get("track");

  if (!artist || !track) {
    return NextResponse.json(
      { error: "artist and track query parameters are required" },
      { status: 400 }
    );
  }

  // Basic input validation to prevent abuse with excessively long queries
  if (artist.length > 200 || track.length > 200) {
    return NextResponse.json(
      { error: "artist and track parameters must not exceed 200 characters" },
      { status: 400 }
    );
  }

  try {
    const lyrics = await getLyrics(artist, track);

    return NextResponse.json(
      { lyrics },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch lyrics" },
      { status: 500 }
    );
  }
}
