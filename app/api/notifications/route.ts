import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const entries = await db.entry.findMany({
      where: {
        feed: {
          userId,
        },
      },
      orderBy: {
        published: "desc",
      },
      take: 50,
      include: {
        feed: true,
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
