import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courses = await db.golfCourse.findMany({
      include: {
        holes: {
          orderBy: {
            holeNumber: "asc",
          },
        },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching golf courses:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
