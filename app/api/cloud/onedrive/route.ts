// api/cloud/onedrive/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { initializeOneDrive, listOneDriveFiles } from "@/lib/cloud-storage";
import { rateLimiter } from "@/lib/redis";
import { getMicrosoftAccessToken } from "@/lib/auth";

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

    // Get valid access token (automatically refreshes if needed)
    const accessToken = await getMicrosoftAccessToken(userId);
    if (!accessToken) {
      return new NextResponse("OneDrive not connected", { status: 403 });
    }

    // Initialize OneDrive client and fetch files
    const client = initializeOneDrive(accessToken);
    const files = await listOneDriveFiles(client);

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching OneDrive files:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
