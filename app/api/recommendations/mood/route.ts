import { NextRequest, NextResponse } from "next/server";
import { getRecommendationsByMood } from "@/lib/ai-discovery";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mood = searchParams.get("mood");

  if (!mood) {
    return NextResponse.json(
      { error: "mood query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const result = await getRecommendationsByMood(mood);

    if (result.error) {
      return NextResponse.json(
        { tracks: [], error: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { tracks: result.tracks, error: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { tracks: [], error: true },
      { status: 500 }
    );
  }
}
