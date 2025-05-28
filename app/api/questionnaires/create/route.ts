import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { FrequencyType, QuestionType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, frequency, boardId, questions } = body;

    // Validate input
    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return new NextResponse("At least one question is required", {
        status: 400,
      });
    }

    // Create questionnaire with questions
    const questionnaire = await db.questionnaire.create({
      data: {
        title,
        description,
        frequency: frequency || FrequencyType.ONCE,
        boardId,
        userId,
        questions: {
          create: questions.map((question: any) => ({
            text: question.text,
            type: question.type || QuestionType.TEXT,
            options: question.options || [],
            order: question.order,
            required: question.required || false,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(questionnaire);
  } catch (error) {
    console.error("Error creating questionnaire:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
