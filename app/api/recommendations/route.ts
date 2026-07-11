import { NextRequest, NextResponse } from "next/server";
import { getTrackById } from "@/lib/itunes";
import { getRecommendations } from "@/lib/recommendations";
import { getRecommendationsByMood } from "@/lib/ai-discovery";
import { searchTracks } from "@/lib/itunes";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const trackId = searchParams.get("trackId");
  const mood = searchParams.get("mood");
  const query = searchParams.get("query");

  // Mood-based recommendations (optionally combined with a search query)
  if (mood) {
    try {
      // If a query is provided, combine mood and query for contextual discovery
      if (query) {
        const searchTerm = `${mood} ${query}`;
        const result = await searchTracks(searchTerm);

        if (!result || result.length === 0) {
          // Fall back to mood-only recommendations
          const moodResult = await getRecommendationsByMood(mood);
          if (moodResult.error) {
            return NextResponse.json(
              { error: "Failed to generate recommendations" },
              { status: 500 }
            );
          }
          return NextResponse.json(
            { tracks: moodResult.tracks },
            {
              headers: {
                "Cache-Control":
                  "public, s-maxage=300, stale-while-revalidate=600",
              },
            }
          );
        }

        const tracks = result.slice(0, 8).map((track) => ({
          ...track,
          reason: `${mood.charAt(0).toUpperCase() + mood.slice(1)} vibes related to "${query}"`,
        }));

        return NextResponse.json(
          { tracks },
          {
            headers: {
              "Cache-Control":
                "public, s-maxage=300, stale-while-revalidate=600",
            },
          }
        );
      }

      const result = await getRecommendationsByMood(mood);

      if (result.error) {
        return NextResponse.json(
          { error: "Failed to generate mood recommendations" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { tracks: result.tracks },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    } catch {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  // Track-based recommendations
  if (!trackId) {
    return NextResponse.json(
      { error: "trackId or mood query parameter is required" },
      { status: 400 }
    );
  }

  const parsedId = parseInt(trackId, 10);
  if (isNaN(parsedId)) {
    return NextResponse.json(
      { error: "trackId must be a valid number" },
      { status: 400 }
    );
  }

  try {
    const track = await getTrackById(parsedId);

    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    const result = await getRecommendations(track);

    if (result.error) {
      return NextResponse.json(
        { error: "Failed to generate recommendations" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { recommendations: result.tracks },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
