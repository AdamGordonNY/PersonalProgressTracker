"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface AnswerInput {
  questionId: string;
  value: any;
}

export async function submitResponse(
  questionnaireId: string,
  answers: AnswerInput[]
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if questionnaire exists
    const questionnaire = await db.questionnaire.findUnique({
      where: { id: questionnaireId },
      include: { questions: true },
    });

    if (!questionnaire) throw new Error("Questionnaire not found");

    // Validate answers
    const questionIds = questionnaire.questions.map((q) => q.id);
    const requiredQuestions = questionnaire.questions
      .filter((q) => q.required)
      .map((q) => q.id);

    const answeredQuestionIds = answers.map((a) => a.questionId);

    // Check if all required questions are answered
    const missingRequired = requiredQuestions.filter(
      (id) => !answeredQuestionIds.includes(id)
    );
    if (missingRequired.length > 0) {
      return { error: "All required questions must be answered" };
    }

    // Check if there are no answers for questions that don't exist
    const invalidQuestionIds = answeredQuestionIds.filter(
      (id) => !questionIds.includes(id)
    );
    if (invalidQuestionIds.length > 0) {
      return { error: "Invalid question IDs in answers" };
    }

    // Create response
    const response = await db.response.create({
      data: {
        questionnaireId,
        userId,
        answers: JSON.stringify(answers),
      },
    });

    revalidatePath(`/questionnaires/${questionnaireId}`);
    return { response };
  } catch (error) {
    console.error("Error submitting response:", error);
    return { error: "Failed to submit response" };
  }
}

export async function getResponses(questionnaireId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if user owns the questionnaire
    const questionnaire = await db.questionnaire.findFirst({
      where: { id: questionnaireId, userId },
    });

    if (!questionnaire)
      throw new Error("Unauthorized or questionnaire not found");

    const responses = await db.response.findMany({
      where: { questionnaireId },
      orderBy: { createdAt: "desc" },
    });

    return { responses };
  } catch (error) {
    console.error("Error fetching responses:", error);
    return { error: "Failed to fetch responses" };
  }
}

export async function getResponsesStats(questionnaireId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if user owns the questionnaire
    const questionnaire = await db.questionnaire.findFirst({
      where: { id: questionnaireId, userId },
      include: {
        questions: true,
        responses: true,
      },
    });

    if (!questionnaire)
      throw new Error("Unauthorized or questionnaire not found");

    // Calculate statistics
    const totalResponses = questionnaire.responses.length;

    // Calculate completion rate
    const completionRates = questionnaire.responses.map((response) => {
      const answers = JSON.parse(response.answers as string) as AnswerInput[];
      const requiredQuestions = questionnaire.questions.filter(
        (q) => q.required
      );
      const answeredRequired = requiredQuestions.filter((q) =>
        answers.some((a) => a.questionId === q.id)
      );
      return answeredRequired.length / requiredQuestions.length;
    });

    const averageCompletionRate =
      completionRates.length > 0
        ? completionRates.reduce((a, b) => a + b, 0) / completionRates.length
        : 0;

    // Calculate average time (if we had timestamps, which we don't in this schema)
    const averageTime = null;

    return {
      stats: {
        totalResponses,
        averageCompletionRate,
        averageTime,
      },
    };
  } catch (error) {
    console.error("Error calculating response stats:", error);
    return { error: "Failed to calculate response statistics" };
  }
}
