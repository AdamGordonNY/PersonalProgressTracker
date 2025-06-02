import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const feed = await db.feed.findUnique({
      where: { id: params.id, userId },
      include: {
        entries: {
          orderBy: { published: "desc" },
          take: 30,
        },
      },
    });

    if (!feed) {
      return new NextResponse("Feed not found", { status: 404 });
    }

    return NextResponse.json(feed);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.feed.delete({
      where: { id: params.id, userId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting feed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
