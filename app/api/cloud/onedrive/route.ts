import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserCloudTokens } from "@/actions/user";
import { initializeOneDrive, listOneDriveFiles } from "@/lib/cloud-storage";
import { kv } from "@vercel/kv";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate limiting
    const rateKey = `rate:cloud:${userId}`;
    const requests = await kv.incr(rateKey);
    await kv.expire(rateKey, 60);

    if (requests > 5) {
      return new NextResponse("Too many requests", { status: 429 });
    }

    const tokens = await getUserCloudTokens(userId);
    if (!tokens?.microsoft) {
      return new NextResponse("OneDrive not connected", { status: 403 });
    }

    const client = initializeOneDrive();
    const files = await listOneDriveFiles(client);

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching OneDrive files:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
