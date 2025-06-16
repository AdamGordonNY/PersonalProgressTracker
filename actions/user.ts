"use server";

import { db } from "@/lib/db";
import { getMicrosoftToken, redisClient } from "@/lib/encryption";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// User management functions
export async function handleUserCreated(eventData: any) {
  try {
    const { id, email_addresses, first_name, last_name } = eventData;

    const user = await db.user.create({
      data: {
        id,
        email: email_addresses[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim() || null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("User creation failed:", error);
    return NextResponse.json(
      { error: "User creation failed" },
      { status: 500 }
    );
  }
}

export async function handleUserUpdated(eventData: any) {
  try {
    const { id, email_addresses, first_name, last_name } = eventData;

    await db.user.update({
      where: { id },
      data: {
        email: email_addresses[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim() || null,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("User update failed:", error);
    return NextResponse.json({ error: "User update failed" }, { status: 500 });
  }
}

export async function handleUserDeleted(eventData: any) {
  try {
    const { id } = eventData;
    if (redisClient.isOpen) {
      await redisClient.del(`user:${id}:onedrive`);
    }
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("User deletion failed:", error);
    return NextResponse.json(
      { error: "User deletion failed" },
      { status: 500 }
    );
  }
}

export async function handleSessionCreated(eventData: any) {
  try {
    const { user_id } = eventData;
    return NextResponse.json({ status: "Session processed" }, { status: 200 });
  } catch (error) {
    console.error("Session creation failed:", error);
    return NextResponse.json(
      { error: "Session processing failed" },
      { status: 500 }
    );
  }
}

// Token management
export async function storeUserMicrosoftToken(
  userId: string,
  tokenData: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }
) {
  if (!redisClient.isOpen) await redisClient.connect();

  await redisClient.hSet(`user:${userId}:onedrive`, {
    accessToken: tokenData.accessToken,
    refreshToken: tokenData.refreshToken,
    expiresAt: tokenData.expiresAt.toString(),
  });

  // Set expiration (30 days)
  await redisClient.expire(`user:${userId}:onedrive`, 2592000);
}

export async function getUserMicrosoftToken(userId: string) {
  if (!redisClient.isOpen) await redisClient.connect();

  const tokens = await redisClient.hGetAll(`user:${userId}:onedrive`);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: parseInt(tokens.expiresAt || "0"),
  };
}

export async function updateUserFeatures(
  userId: string,
  features: Record<string, boolean>,
  onboardingCompleted: boolean = false
) {
  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        features,
        onboardingCompleted,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user features:", error);
    return { success: false, error: "Failed to update user features" };
  }
}

export async function getUserFeatures(userId: string) {
  try {
    const user = await db.user.findFirst({
      where: { id: userId },
      select: {
        features: true,
        onboardingCompleted: true,
      },
    });
    return {
      features: (user?.features as Record<string, boolean>) || {},
      onboardingCompleted: user?.onboardingCompleted || false,
      error: null,
    };
  } catch (error) {
    console.error("Error getting user features:", error);
    return {
      features: {},
      onboardingCompleted: false,
      error: "Error Getting User Features",
    };
  }
}

// Data access
export async function getUserWithData(userId: string) {
  try {
    return await db.user.findUnique({
      where: { id: userId },
      include: {
        boards: {
          include: {
            columns: {
              include: {
                cards: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}
