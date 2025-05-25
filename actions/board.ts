"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getBoards() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const boards = await db.board.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    });

    return { boards };
  } catch (error) {
    return { error: "Failed to fetch boards" };
  }
}

export async function getBoard(boardId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const board = await db.board.findUnique({
      where: { id: boardId, userId },
      include: {
        columns: {
          include: {
            cards: {
              include: {
                keywords: true,
                attachments: true,
                factSources: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return { board };
  } catch (error) {
    return { error: "Failed to fetch board" };
  }
}

export async function createBoard(data: {
  title: string;
  description?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const lastBoard = await db.board.findFirst({
      where: { userId },
      orderBy: { order: "desc" },
    });

    const board = await db.board.create({
      data: {
        ...data,
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
    });

    revalidatePath("/dashboard");
    return { board };
  } catch (error) {
    return { error: "Failed to create board" };
  }
}

export async function updateBoard(
  boardId: string,
  data: { title?: string; description?: string; color?: string }
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const board = await db.board.update({
      where: { id: boardId, userId },
      data,
    });

    revalidatePath("/dashboard");
    return { board };
  } catch (error) {
    return { error: "Failed to update board" };
  }
}

export async function deleteBoard(boardId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.board.delete({
      where: { id: boardId, userId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete board" };
  }
}

export async function reorderBoards(updates: { id: string; order: number }[]) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.$transaction(
      updates.map(({ id, order }) =>
        db.board.update({
          where: { id, userId },
          data: { order },
        })
      )
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to reorder boards" };
  }
}
// actions/board.ts
export const getDefaultBoard = async () => {
  try {
    const boards = await db.board.findMany({
      orderBy: { order: "asc" },
      take: 1,
      include: {
        columns: {
          include: {
            cards: {
              include: {
                keywords: true,
                attachments: true,
                factSources: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return { board: boards[0] || null };
  } catch (error) {
    return { error: "Failed to load default board" };
  }
};

export const getBoardDetails = async (boardId: string) => {
  try {
    const board = await db.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          include: { cards: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return board ? { board } : { error: "Board not found" };
  } catch (error) {
    return { error: "Failed to load board details" };
  }
};
