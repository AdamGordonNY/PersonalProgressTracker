import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updates = await req.json();

    // Update all columns in a transaction
    await db.$transaction(
      updates.map(({ id, order }: { id: string; order: number }) =>
        db.column.update({
          where: { id, userId },
          data: { order },
        })
      )
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error reordering columns:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
