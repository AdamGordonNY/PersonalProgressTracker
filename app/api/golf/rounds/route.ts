import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
      take: 10, // Limit to recent 10 rounds
    });

    return NextResponse.json(rounds);
  } catch (error) {
    console.error("Error fetching golf rounds:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
