import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const board = await db.board.findUnique({
      where: {
        id: boardId,
        userId,
      },
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
    });

    if (!board) {
      return new NextResponse("Board not found", { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("Error fetching board:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, color } = await req.json();

    const board = await db.board.update({
      where: {
        id: boardId,
        userId,
      },
      data: {
        title,
        description,
        color,
      },
    });

    return NextResponse.json(board);
  } catch (error) {
    console.error("Error updating board:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { boardId } = await params;
    await db.board.delete({
      where: {
        id: boardId,
        userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting board:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
