"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AttachmentType } from "@prisma/client";

export async function createAttachment(data: {
  name: string;
  url?: string;
  content?: string;
  fileType: string;
  type: AttachmentType;
  provider?: string;
  cardId: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const attachment = await db.attachment.create({
      data: {
        ...data,
        userId,
      },
    });

    revalidatePath("/dashboard");
    return { attachment };
  } catch (error) {
    console.error("Error creating attachment:", error);
    return { error: "Failed to create attachment" };
  }
}

export async function updateAttachment(
  attachmentId: string,
  data: {
    name?: string;
    url?: string;
    content?: string;
    fileType?: string;
    type?: AttachmentType;
    provider?: string;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const attachment = await db.attachment.update({
      where: {
        id: attachmentId,
        userId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { attachment };
  } catch (error) {
    console.error("Error updating attachment:", error);
    return { error: "Failed to update attachment" };
  }
}

export async function deleteAttachment(attachmentId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.attachment.delete({
      where: {
        id: attachmentId,
        userId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return { error: "Failed to delete attachment" };
  }
}

export async function getAttachments(cardId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const attachments = await db.attachment.findMany({
      where: {
        cardId,
        userId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { attachments };
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return { error: "Failed to fetch attachments" };
  }
}

export async function createNote(data: {
  title: string;
  content: string;
  cardId: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const note = await db.note.create({
      data: {
        ...data,
        userId,
      },
    });

    revalidatePath("/dashboard");
    return { note };
  } catch (error) {
    console.error("Error creating note:", error);
    return { error: "Failed to create note" };
  }
}

export async function updateNote(
  noteId: string,
  data: {
    title?: string;
    content?: string;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const note = await db.note.update({
      where: {
        id: noteId,
        userId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { note };
  } catch (error) {
    console.error("Error updating note:", error);
    return { error: "Failed to update note" };
  }
}

export async function deleteNote(noteId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.note.delete({
      where: {
        id: noteId,
        userId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting note:", error);
    return { error: "Failed to delete note" };
  }
}

export async function getNotes(cardId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const notes = await db.note.findMany({
      where: {
        cardId,
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return { notes };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return { error: "Failed to fetch notes" };
  }
}
