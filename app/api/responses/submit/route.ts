import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { questionnaireId, answers } = body;

    // Validate input
    if (!questionnaireId) {
      return new NextResponse("Questionnaire ID is required", { status: 400 });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return new NextResponse("Answers are required", { status: 400 });
    }

    // Check if questionnaire exists
    const questionnaire = await db.questionnaire.findUnique({
      where: { id: questionnaireId },
      include: { questions: true },
    });

    if (!questionnaire) {
      return new NextResponse("Questionnaire not found", { status: 404 });
    }

    // Validate answers
    const questionIds = questionnaire.questions.map((q) => q.id);
    const requiredQuestions = questionnaire.questions
      .filter((q) => q.required)
      .map((q) => q.id);

    const answeredQuestionIds = answers.map((a: any) => a.questionId);

    // Check if all required questions are answered
    const missingRequired = requiredQuestions.filter(
      (id) => !answeredQuestionIds.includes(id)
    );
    if (missingRequired.length > 0) {
      return new NextResponse("All required questions must be answered", {
        status: 400,
      });
    }

    // Check if there are no answers for questions that don't exist
    const invalidQuestionIds = answeredQuestionIds.filter(
      (id) => !questionIds.includes(id)
    );
    if (invalidQuestionIds.length > 0) {
      return new NextResponse("Invalid question IDs in answers", {
        status: 400,
      });
    }

    // Create response
    const response = await db.response.create({
      data: {
        questionnaireId,
        userId,
        answers,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error submitting response:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
