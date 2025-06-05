import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const card = await db.card.findUnique({
      where: {
        id: params.id,
        userId,
      },
      include: {
        keywords: true,
        attachments: true,
        factSources: true,
        Note: true,
      },
    });

    if (!card) {
      return new NextResponse("Card not found", { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error fetching card:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, columnId, keywords, factSources } =
      await req.json();

    const card = await db.card.update({
      where: {
        id: params.id,
        userId,
      },
      data: {
        title,
        description,
        columnId,
        keywords: keywords
          ? {
              deleteMany: {},
              create: keywords.map((name: string) => ({ name })),
            }
          : undefined,
        factSources: factSources
          ? {
              deleteMany: {},
              create: factSources.map((source: any) => ({
                title: source.title,
                url: source.url || "",
                quote: source.quote || "",
              })),
            }
          : undefined,
      },
      include: {
        keywords: true,
        attachments: true,
        factSources: true,
        Note: true,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error updating card:", error);
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

    await db.card.delete({
      where: {
        id: params.id,
        userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting card:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
