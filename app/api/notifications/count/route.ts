import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const runtime = "edge";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const badgeKey = `user:${userId}:badge`;
    const count = (await kv.get<number>(badgeKey)) || 0;

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
