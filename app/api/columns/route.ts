import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const columns = await db.column.findMany({
      where: { userId },
      include: {
        cards: {
          include: {
            keywords: true,
            attachments: true,
            factSources: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(columns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, boardId } = await req.json();

    const lastColumn = await db.column.findFirst({
      where: { userId, boardId },
      orderBy: { order: "desc" },
    });

    const newOrder = (lastColumn?.order ?? -1) + 1;

    const column = await db.column.create({
      data: {
        title,
        order: newOrder,
        userId,
        boardId,
      },
    });

    return NextResponse.json(column);
  } catch (error) {
    console.error("Error creating column:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
