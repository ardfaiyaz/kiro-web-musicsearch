import { NextRequest, NextResponse } from "next/server";
import { searchMusicVideos } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const limitParam = searchParams.get("limit");

  if (!query) {
    return NextResponse.json(
      { error: "query parameter is required" },
      { status: 400 }
    );
  }

  const limit = limitParam ? parseInt(limitParam, 10) : 5;

  if (isNaN(limit) || limit < 1 || limit > 20) {
    return NextResponse.json(
      { error: "limit must be a number between 1 and 20" },
      { status: 400 }
    );
  }

  try {
    const videos = await searchMusicVideos(query, limit);

    return NextResponse.json(
      { videos },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to search YouTube videos" },
      { status: 500 }
    );
  }
}
