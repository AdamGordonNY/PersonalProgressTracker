import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { rateLimiter } from "@/lib/redis";

export const runtime = "nodejs";

const feedSchema = z.object({
  url: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate limiting
    const rateKey = `rate:${userId}`;
    const allowed = await rateLimiter(rateKey, 5, 60);

    if (!allowed) {
      return new NextResponse("Too many requests", { status: 429 });
    }

    const body = await req.json();
    const result = feedSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse("Invalid feed URL", { status: 400 });
    }

    const feed = await db.feed.create({
      data: {
        url: result.data.url,
        userId,
      },
    });
    return NextResponse.json(feed);
  } catch (error) {
    console.error("Error creating feed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const feeds = await db.feed.findMany({
      where: { userId },
      include: {
        entries: {
          orderBy: { published: "desc" },
          take: 10,
        },
      },
    });

    return NextResponse.json(feeds);
  } catch (error) {
    console.error("Error fetching feeds:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
