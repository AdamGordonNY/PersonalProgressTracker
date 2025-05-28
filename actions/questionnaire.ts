"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { FrequencyType, QuestionType } from "@prisma/client";

export interface QuestionInput {
  id?: string;
  text: string;
  type: QuestionType;
  options: string[];
  order: number;
  required: boolean;
}

export interface QuestionnaireInput {
  title: string;
  description?: string;
  frequency?: FrequencyType;
  boardId?: string;
  questions: QuestionInput[];
}

export async function createQuestionnaire(data: QuestionnaireInput) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const questionnaire = await db.questionnaire.create({
      data: {
        title: data.title,
        description: data.description,
        frequency: data.frequency || FrequencyType.ONCE,
        boardId: data.boardId,
        userId,
        questions: {
          create: data.questions.map((question) => ({
            text: question.text,
            type: question.type,
            options: question.options,
            order: question.order,
            required: question.required,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    revalidatePath("/questionnaires");
    return { questionnaire };
  } catch (error) {
    console.error("Error creating questionnaire:", error);
    return { error: "Failed to create questionnaire" };
  }
}

export async function updateQuestionnaire(
  id: string,
  data: QuestionnaireInput
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // First, update the questionnaire
    const questionnaire = await db.questionnaire.update({
      where: { id, userId },
      data: {
        title: data.title,
        description: data.description,
        frequency: data.frequency,
        boardId: data.boardId,
      },
    });

    // Then, delete existing questions and create new ones
    await db.question.deleteMany({
      where: { questionnaireId: id },
    });

    const questions = await db.question.createMany({
      data: data.questions.map((question) => ({
        text: question.text,
        type: question.type,
        options: question.options,
        order: question.order,
        required: question.required,
        questionnaireId: id,
      })),
    });

    revalidatePath("/questionnaires");
    return { questionnaire, questions };
  } catch (error) {
    console.error("Error updating questionnaire:", error);
    return { error: "Failed to update questionnaire" };
  }
}

export async function deleteQuestionnaire(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.questionnaire.delete({
      where: { id, userId },
    });

    revalidatePath("/questionnaires");
    return { success: true };
  } catch (error) {
    console.error("Error deleting questionnaire:", error);
    return { error: "Failed to delete questionnaire" };
  }
}

export async function getQuestionnaires() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const questionnaires = await db.questionnaire.findMany({
      where: { userId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        responses: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return { questionnaires };
  } catch (error) {
    console.error("Error fetching questionnaires:", error);
    return { error: "Failed to fetch questionnaires" };
  }
}

export async function getQuestionnaire(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const questionnaire = await db.questionnaire.findUnique({
      where: { id, userId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!questionnaire) throw new Error("Questionnaire not found");

    return { questionnaire };
  } catch (error) {
    console.error("Error fetching questionnaire:", error);
    return { error: "Failed to fetch questionnaire" };
  }
}
