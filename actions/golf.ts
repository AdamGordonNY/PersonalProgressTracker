"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ClubType, ShotType } from "@prisma/client";

// Course-related actions
export async function createCourse(data: {
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  holes: Array<{
    holeNumber: number;
    par: number;
    yards: number;
    handicap: number;
  }>;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const course = await db.golfCourse.create({
      data: {
        name: data.name,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        holes: {
          create: data.holes.map((hole) => ({
            holeNumber: hole.holeNumber,
            par: hole.par,
            yards: hole.yards,
            handicap: hole.handicap,
          })),
        },
      },
      include: {
        holes: {
          orderBy: {
            holeNumber: "asc",
          },
        },
      },
    });

    revalidatePath("/golf");
    return { course };
  } catch (error) {
    console.error("Error creating course:", error);
    return { error: "Failed to create course" };
  }
}

export async function getCourses() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const courses = await db.golfCourse.findMany({
      include: {
        holes: {
          orderBy: {
            holeNumber: "asc",
          },
        },
      },
    });

    return { courses };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { error: "Failed to fetch courses" };
  }
}

export async function getCourse(courseId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const course = await db.golfCourse.findUnique({
      where: { id: courseId },
      include: {
        holes: {
          orderBy: {
            holeNumber: "asc",
          },
        },
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    return { course };
  } catch (error) {
    console.error("Error fetching course:", error);
    return { error: "Failed to fetch course" };
  }
}

// Round-related actions
export async function createRound(data: {
  courseName: string;
  date: string;
  totalScore: number;
  totalPutts: number;
  fairwaysHit: number;
  greensInReg: number;
  courseId?: string;
  weather?: any;
  holes: Array<{
    holeNumber: number;
    par: number;
    strokes: number;
    putts: number;
    fairwayHit: boolean;
  }>;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const round = await db.golfRound.create({
      data: {
        userId,
        courseName: data.courseName,
        date: new Date(data.date),
        totalScore: data.totalScore,
        totalPutts: data.totalPutts,
        fairwaysHit: data.fairwaysHit,
        greensInReg: data.greensInReg,
        courseId: data.courseId,
        weather: data.weather,
        holes: {
          create: data.holes.map((hole) => ({
            holeNumber: hole.holeNumber,
            par: hole.par,
            strokes: hole.strokes,
            putts: hole.putts,
            fairwayHit: hole.fairwayHit,
          })),
        },
      },
      include: {
        holes: {
          orderBy: {
            holeNumber: "asc",
          },
        },
      },
    });

    revalidatePath("/golf");
    return { round };
  } catch (error) {
    console.error("Error creating round:", error);
    return { error: "Failed to create round" };
  }
}

export async function getRounds() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const rounds = await db.golfRound.findMany({
      where: { userId },
      include: {
        holes: {
          orderBy: {
            holeNumber: "asc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return { rounds };
  } catch (error) {
    console.error("Error fetching rounds:", error);
    return { error: "Failed to fetch rounds" };
  }
}

export async function getRound(roundId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const round = await db.golfRound.findUnique({
      where: {
        id: roundId,
        userId,
      },
      include: {
        holes: {
          orderBy: {
            holeNumber: "asc",
          },
        },
        shots: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!round) {
      throw new Error("Round not found");
    }

    return { round };
  } catch (error) {
    console.error("Error fetching round:", error);
    return { error: "Failed to fetch round" };
  }
}

// Shot-related actions
export async function addShot(data: {
  roundId: string;
  holeId: string;
  club: ClubType;
  shotType: ShotType;
  distance: number;
  result?: string;
  elevation?: number;
  windSpeed?: number;
  windDirection?: string;
  latitude?: number;
  longitude?: number;
  note?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify user owns the round
    const round = await db.golfRound.findUnique({
      where: {
        id: data.roundId,
        userId,
      },
    });

    if (!round) {
      throw new Error("Round not found or access denied");
    }

    const shot = await db.golfShot.create({
      data: {
        roundId: data.roundId,
        holeId: data.holeId,
        club: data.club,
        shotType: data.shotType,
        distance: data.distance,
        result: data.result,
        elevation: data.elevation,
        windSpeed: data.windSpeed,
        windDirection: data.windDirection,
        latitude: data.latitude,
        longitude: data.longitude,
        note: data.note,
      },
    });

    revalidatePath(`/golf/rounds/${data.roundId}`);
    return { shot };
  } catch (error) {
    console.error("Error adding shot:", error);
    return { error: "Failed to add shot" };
  }
}

export async function getShots(roundId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify user owns the round
    const round = await db.golfRound.findUnique({
      where: {
        id: roundId,
        userId,
      },
    });

    if (!round) {
      throw new Error("Round not found or access denied");
    }

    const shots = await db.golfShot.findMany({
      where: {
        roundId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return { shots };
  } catch (error) {
    console.error("Error fetching shots:", error);
    return { error: "Failed to fetch shots" };
  }
}

// Analytics actions
export async function getGolfStats() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

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
      return {
        stats: {
          roundsPlayed: 0,
          averageScore: null,
          bestScore: null,
          worstScore: null,
          fairwayPercentage: null,
          averagePutts: null,
        },
      };
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

    return {
      stats: {
        roundsPlayed,
        averageScore,
        bestScore,
        worstScore,
        fairwayPercentage,
        averagePutts,
        shotsByType,
        clubUsage,
        scoreTrend,
      },
    };
  } catch (error) {
    console.error("Error calculating golf stats:", error);
    return { error: "Failed to calculate stats" };
  }
}
