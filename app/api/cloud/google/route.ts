import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserCloudTokens } from "@/actions/user";
import {
  initializeGoogleDrive,
  listGoogleDriveFiles,
} from "@/lib/cloud-storage";
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
    if (!tokens?.google) {
      return new NextResponse("Google Drive not connected", { status: 403 });
    }

    const drive = initializeGoogleDrive();
    const files = await listGoogleDriveFiles(drive);

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching Google Drive files:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
