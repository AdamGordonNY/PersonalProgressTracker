"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createColumn(boardId: string, data: { title: string }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const lastColumn = await db.column.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
    });

    const column = await db.column.create({
      data: {
        ...data,
        boardId,
        userId,
        order: (lastColumn?.order ?? -1) + 1,
      },
    });

    revalidatePath("/dashboard");
    return { column };
  } catch (error) {
    return { error: "Failed to create column" };
  }
}

export async function updateColumn(columnId: string, data: { title: string }) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    const column = await db.column.update({
      where: { id: columnId },
      data,
    });

    revalidatePath("/dashboard");
    return { column };
  } catch (error) {
    return { error: "Failed to update column" };
  }
}

export async function deleteColumn(columnId: string) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    await db.column.delete({
      where: { id: columnId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete column" };
  }
}

export async function reorderColumns(updates: { id: string; order: number }[]) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    await db.$transaction(
      updates.map(({ id, order }) =>
        db.column.update({
          where: { id },
          data: { order },
        })
      )
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to reorder columns" };
  }
}
