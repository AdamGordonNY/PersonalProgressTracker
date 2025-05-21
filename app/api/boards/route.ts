import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const boards = await db.board.findMany({
      where: { userId },
      include: {
        columns: {
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
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description } = await req.json();

    const lastBoard = await db.board.findFirst({
      where: { userId },
      orderBy: { order: "desc" },
    });

    const board = await db.board.create({
      data: {
        title,
        description,
        userId,
        order: (lastBoard?.order ?? -1) + 1,
        columns: {
          create: [
            { title: "Ideas", order: 0, userId },
            { title: "Research", order: 1, userId },
            { title: "In Progress", order: 2, userId },
            { title: "Done", order: 3, userId },
          ],
        },
      },
      include: {
        columns: true,
      },
    });

    return NextResponse.json(board);
  } catch (error) {
    console.error("Error creating board:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
