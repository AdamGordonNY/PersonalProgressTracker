"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCard(data: {
  title: string;
  description?: string;
  columnId: string;
  keywords: string[];
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const lastCard = await db.card.findFirst({
      where: { columnId: data.columnId },
      orderBy: { order: "desc" },
    });

    const card = await db.card.create({
      data: {
        title: data.title,
        description: data.description,
        columnId: data.columnId,
        userId,
        order: (lastCard?.order ?? -1) + 1,
        keywords: {
          create: data.keywords.map((name) => ({
            name,
            user: { connect: { id: userId } },
          })),
        },
      },
      include: {
        keywords: true,
        attachments: true,
        factSources: true,
      },
    });

    revalidatePath("/dashboard");
    return { card };
  } catch (error) {
    return { error: "Failed to create card" };
  }
}

export async function updateCard(
  cardId: string,
  data: {
    title?: string;
    description?: string;
    columnId?: string;
    keywords?: string[];
    factSources?: Array<{
      title: string;
      url?: string;
      quote?: string;
    }>;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const card = await db.card.update({
      where: { id: cardId, userId },
      data: {
        ...data,
        keywords: data.keywords
          ? {
              deleteMany: {},
              create: data.keywords.map((name) => ({
                name,
                user: { connect: { id: userId } },
              })),
            }
          : undefined,
        factSources: data.factSources
          ? {
              deleteMany: {},
              create: data.factSources.map((source) => ({
                title: source.title,
                url: source.url || "",
                quote: source.quote || "",
                user: { connect: { id: userId } },
              })),
            }
          : undefined,
      },
      include: {
        keywords: true,
        attachments: true,
        factSources: true,
      },
    });

    revalidatePath("/dashboard");
    return { card };
  } catch (error) {
    return { error: "Failed to update card" };
  }
}

export async function deleteCard(cardId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.card.delete({
      where: { id: cardId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete card" };
  }
}

export async function reorderCards(
  updates: { id: string; columnId: string; order: number }[]
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.$transaction(
      updates.map(({ id, columnId, order }) =>
        db.card.update({
          where: { id },
          data: { columnId, order },
        })
      )
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to reorder cards" };
  }
}
export async function searchKeywords(query: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const keywords = await db.keyword.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
        card: {
          userId,
        },
      },
      include: {
        card: true,
      },
    });

    return { keywords };
  } catch (error) {
    return { error: "Failed to search keywords" };
  }
}
