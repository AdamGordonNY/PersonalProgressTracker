import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const WidgetStateSchema = z.object({
  isMinimized: z.boolean(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  size: z.object({
    width: z.number(),
    height: z.number(),
  }),
  zIndex: z.number(),
});

const UIPreferencesSchema = z.object({
  focusFortress: WidgetStateSchema.optional(),
  timeGuardian: WidgetStateSchema.optional(),
  postureChecker: WidgetStateSchema.optional(),
  highestZIndex: z.number().optional(),
});

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = UIPreferencesSchema.parse(body);

    // Get current user preferences
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { uiPreferences: true },
    });

    // Merge with existing preferences
    const currentPreferences = (user?.uiPreferences as object) || {};
    const updatedPreferences = {
      ...currentPreferences,
      ...validatedData,
    };

    // Update user preferences
    await db.user.update({
      where: { id: userId },
      data: {
        uiPreferences: updatedPreferences,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user preferences:", error);

    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { uiPreferences: true },
    });

    return NextResponse.json(user?.uiPreferences || {});
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
