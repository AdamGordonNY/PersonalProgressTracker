import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get rounds
    const rounds = await db.golfRound.findMany({
      where: { userId },
      include: {
        holes: true,
        shots: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    if (rounds.length === 0) {
      return NextResponse.json({
        roundsPlayed: 0,
        averageScore: null,
        bestScore: null,
        worstScore: null,
        fairwayPercentage: null,
        averagePutts: null,
      });
    }

    // Calculate stats
    const roundsPlayed = rounds.length;

    const totalScore = rounds.reduce((sum, round) => sum + round.totalScore, 0);
    const averageScore = Math.round((totalScore / roundsPlayed) * 10) / 10;

    const scores = rounds.map((round) => round.totalScore);
    const bestScore = Math.min(...scores);
    const worstScore = Math.max(...scores);

    const totalFairways = rounds.reduce((sum, round) => sum + 9, 0); // Assuming 9 holes per round
    const fairwaysHit = rounds.reduce(
      (sum, round) => sum + round.fairwaysHit,
      0
    );
    const fairwayPercentage = Math.round((fairwaysHit / totalFairways) * 100);

    const totalPutts = rounds.reduce((sum, round) => sum + round.totalPutts, 0);
    const averagePutts = Math.round((totalPutts / roundsPlayed) * 10) / 10;

    // Calculate shot distribution
    const shotsByType = rounds
      .flatMap((round) => round.shots)
      .reduce(
        (acc, shot) => {
          acc[shot.shotType] = (acc[shot.shotType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    // Calculate club usage
    const clubUsage = rounds
      .flatMap((round) => round.shots)
      .reduce(
        (acc, shot) => {
          acc[shot.club] = (acc[shot.club] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    // Calculate score trends
    const scoreTrend = rounds.map((round) => ({
      date: round.date,
      score: round.totalScore,
    }));

    return NextResponse.json({
      roundsPlayed,
      averageScore,
      bestScore,
      worstScore,
      fairwayPercentage,
      averagePutts,
      shotsByType,
      clubUsage,
      scoreTrend,
    });
  } catch (error) {
    console.error("Error calculating golf stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
