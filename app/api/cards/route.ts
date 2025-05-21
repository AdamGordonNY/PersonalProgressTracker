import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, columnId, keywords } = await req.json();

    const lastCard = await db.card.findFirst({
      where: { columnId },
      orderBy: { order: "desc" },
    });

    const newOrder = (lastCard?.order ?? -1) + 1;

    const card = await db.card.create({
      data: {
        title,
        description,
        columnId,
        userId,
        order: newOrder,
        keywords: {
          create: keywords.map((keyword: string) => ({
            name: keyword,
          })),
        },
      },
      include: {
        keywords: true,
        attachments: true,
        factSources: true,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error creating card:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, title, description, columnId, order, keywords } =
      await req.json();

    const card = await db.card.update({
      where: { id, userId },
      data: {
        title,
        description,
        columnId,
        order,
        keywords: {
          deleteMany: {},
          create: keywords.map((keyword: string) => ({
            name: keyword,
          })),
        },
      },
      include: {
        keywords: true,
        attachments: true,
        factSources: true,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error updating card:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Card ID is required", { status: 400 });
    }

    await db.card.delete({
      where: { id, userId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting card:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
