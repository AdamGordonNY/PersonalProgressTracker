import { getMicrosoftAccessToken } from "@/lib/auth";
import { initializeOneDrive, listOneDriveFiles } from "@/lib/cloud-storage";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const accessToken = await getMicrosoftAccessToken(userId);
    if (!accessToken) {
      return new NextResponse("OneDrive not connected", { status: 403 });
    }

    const client = initializeOneDrive(accessToken);
    const files = await listOneDriveFiles(client);

    return NextResponse.json(files);
  } catch (error) {
    console.error("OneDrive error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
