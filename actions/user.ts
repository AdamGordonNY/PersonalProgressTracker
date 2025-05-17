"use server";

import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { clerkClient } from "@clerk/nextjs/server";
import { CloudTokens } from "@/lib/types";
import { User } from "@prisma/client";

export async function updateUserCloudTokens(
  userId: string,
  tokens: CloudTokens
) {
  try {
    // Encrypt tokens before storing
    const encryptedTokens = Object.entries(tokens).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc[key] = encrypt(value);
        }
        return acc;
      },
      {} as Record<string, string>
    );

    // Update database
    await db.user.update({
      where: { id: userId },
      data: {
        cloudTokens: encryptedTokens,
      },
    });

    // Update Clerk metadata
    await (
      await clerkClient()
    ).users.updateUserMetadata(userId, {
      publicMetadata: {
        cloudAccess: {
          google: !!tokens.google,
          microsoft: !!tokens.microsoft,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating cloud tokens:", error);
    return { success: false, error: "Failed to update cloud tokens" };
  }
}

export async function getUserCloudTokens(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { cloudTokens: true },
    });

    if (!user?.cloudTokens) return null;

    // Decrypt tokens
    return Object.entries(user.cloudTokens).reduce((acc, [key, value]) => {
      acc[key] = decrypt(value);
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error("Error getting cloud tokens:", error);
    return null;
  }
}

export async function updateUserSubscription(
  userId: string,
  tier: "free" | "pro"
) {
  try {
    await (
      await clerkClient()
    ).users.updateUser(userId, {
      publicMetadata: {
        subscriptionTier: tier,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return { success: false, error: "Failed to update subscription" };
  }
}
