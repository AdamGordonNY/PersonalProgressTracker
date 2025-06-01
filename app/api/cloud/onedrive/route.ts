import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserCloudTokens } from "@/actions/user";
import { initializeOneDrive, listOneDriveFiles } from "@/lib/cloud-storage";
import { rateLimiter } from "@/lib/redis";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate limiting
    const rateKey = `rate:cloud:${userId}`;
    const allowed = await rateLimiter(rateKey, 5, 60);

    if (!allowed) {
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
