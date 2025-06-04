import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { AttachmentType } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the card ID from the URL parameter
    const cardId = params.id;

    // Check if the card exists and belongs to the user
    const card = await db.card.findUnique({
      where: { id: cardId, userId },
    });

    if (!card) {
      return new NextResponse("Card not found", { status: 404 });
    }

    // Get all attachments for the card
    const attachments = await db.attachment.findMany({
      where: { cardId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the card ID from the URL parameter
    const cardId = params.id;

    // Parse the request body
    const {
      name,
      url,
      content,
      fileType,
      type = AttachmentType.FILE,
      provider,
    } = await req.json();

    // Validate required fields
    if (!name || !fileType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if the card exists and belongs to the user
    const card = await db.card.findUnique({
      where: { id: cardId, userId },
    });

    if (!card) {
      return new NextResponse("Card not found", { status: 404 });
    }

    // Create the attachment
    const attachment = await db.attachment.create({
      data: {
        name,
        url,
        content,
        fileType,
        type,
        provider,
        cardId,
        userId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("Error creating attachment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
