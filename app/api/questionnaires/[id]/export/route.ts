import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const questionnaireId = id;

    // Check if user owns the questionnaire
    const questionnaire = await db.questionnaire.findFirst({
      where: { id: questionnaireId, userId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        responses: true,
      },
    });

    if (!questionnaire) {
      return new NextResponse("Questionnaire not found", { status: 404 });
    }

    // Create CSV header row
    const questions = questionnaire.questions;
    const headerRow = [
      "ResponseID",
      "Timestamp",
      ...questions.map((q) => q.text),
    ];

    // Create CSV data rows
    const dataRows = questionnaire.responses.map((response) => {
      const answers = JSON.parse(response.answers as string);
      const row = [response.id, response.createdAt.toISOString()];

      // Add answer for each question (or empty string if not answered)
      for (const question of questions) {
        const answer = answers.find((a: any) => a.questionId === question.id);
        row.push(answer ? String(answer.value) : "");
      }

      return row;
    });

    // Combine header and data rows
    const csvRows = [headerRow, ...dataRows];

    // Convert to CSV string
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    // Set headers for file download
    const headers = {
      "Content-Disposition": `attachment; filename="questionnaire_${questionnaireId}_responses.csv"`,
      "Content-Type": "text/csv",
    };

    return new NextResponse(csvContent, { headers });
  } catch (error) {
    console.error("Error exporting questionnaire responses:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
