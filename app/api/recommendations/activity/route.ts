import { NextRequest, NextResponse } from "next/server";
import { getRecommendationsByActivity } from "@/lib/ai-discovery";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const activity = searchParams.get("activity");

  if (!activity) {
    return NextResponse.json(
      { error: "activity query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const result = await getRecommendationsByActivity(activity);

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
