import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const redisClient = await getRedis();
    const badgeKey = `user:${userId}:badge`;
    await redisClient.set(badgeKey, "0");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting notification count:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
