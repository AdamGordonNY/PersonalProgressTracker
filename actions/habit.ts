"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Priority } from "@prisma/client";

export interface HabitInput {
  name: string;
  description?: string;
  priority?: Priority;
  coins?: number;
  location?: string;
  timeOfDay?: string;
}

export async function createHabit(data: HabitInput) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const timeOfDay = data.timeOfDay
      ? new Date(`1970-01-01T${data.timeOfDay}:00`)
      : undefined;

    const habit = await db.habit.create({
      data: {
        name: data.name,
        description: data.description,
        priority: data.priority || Priority.OPTIONAL,
        coins: data.coins || 10,
        location: data.location,
        timeOfDay,
        userId,
      },
    });

    revalidatePath("/habits");
    return { habit };
  } catch (error) {
    console.error("Error creating habit:", error);
    return { error: "Failed to create habit" };
  }
}

export async function updateHabit(habitId: string, data: HabitInput) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const timeOfDay = data.timeOfDay
      ? new Date(`1970-01-01T${data.timeOfDay}:00`)
      : undefined;

    const habit = await db.habit.update({
      where: { id: habitId, userId },
      data: {
        name: data.name,
        description: data.description,
        priority: data.priority,
        coins: data.coins,
        location: data.location,
        timeOfDay,
      },
    });

    revalidatePath("/habits");
    return { habit };
  } catch (error) {
    console.error("Error updating habit:", error);
    return { error: "Failed to update habit" };
  }
}

export async function deleteHabit(habitId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.habit.delete({
      where: { id: habitId, userId },
    });

    revalidatePath("/habits");
    return { success: true };
  } catch (error) {
    console.error("Error deleting habit:", error);
    return { error: "Failed to delete habit" };
  }
}

export async function getHabits() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const habits = await db.habit.findMany({
      where: { userId },
      include: {
        completions: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { habits };
  } catch (error) {
    console.error("Error fetching habits:", error);
    return { error: "Failed to fetch habits" };
  }
}

export async function completeHabit(habitId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if habit belongs to user
    const habit = await db.habit.findUnique({
      where: { id: habitId, userId },
    });

    if (!habit) throw new Error("Habit not found");

    // Check if already completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCompletion = await db.completion.findFirst({
      where: {
        habitId,
        date: {
          gte: today,
        },
      },
    });

    if (existingCompletion) {
      return { error: "Habit already completed today" };
    }

    // Create a completion for today
    const completion = await db.completion.create({
      data: {
        habitId,
        date: new Date(),
      },
    });

    // Add coins to user's balance
    await db.user.update({
      where: { id: userId },
      data: {
        coins: { increment: habit.coins },
      },
    });

    revalidatePath("/habits");
    return { completion, coinsEarned: habit.coins };
  } catch (error) {
    console.error("Error completing habit:", error);
    return { error: "Failed to complete habit" };
  }
}

export async function getHabitCompletions(days: number = 30) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const habits = await db.habit.findMany({
      where: { userId },
      include: {
        completions: {
          where: {
            date: {
              gte: startDate,
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    return { habits };
  } catch (error) {
    console.error("Error fetching habit completions:", error);
    return { error: "Failed to fetch habit completions" };
  }
}

export async function getUserCoins() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    return { coins: user?.coins || 0 };
  } catch (error) {
    console.error("Error fetching user coins:", error);
    return { error: "Failed to fetch user coins" };
  }
}
