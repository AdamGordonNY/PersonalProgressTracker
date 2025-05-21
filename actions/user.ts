"use server";

import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { CloudTokens } from "@/lib/types";
import { User } from "@prisma/client";

export async function updateUserCloudTokens(
  userId: string,
  tokens: CloudTokens
) {
  try {
    // Encrypt tokens before storing
    const encryptedTokensEntries = await Promise.all(
      Object.entries(tokens).map(async ([key, value]) => {
        if (value) {
          return [key, await encrypt(value)];
        }
        return [key, value];
      })
    );
    const encryptedTokens = Object.fromEntries(encryptedTokensEntries);

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
    const decryptedEntries = await Promise.all(
      Object.entries(user.cloudTokens).map(async ([key, value]) => {
        return [key, await decrypt(value)];
      })
    );
    return Object.fromEntries(decryptedEntries) as Record<string, string>;
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
export async function getUserCards() {
  try {
    const { userId } = await auth();
    const user = await db.user.findUnique({
      where: { id: userId! },
      include: {
        cards: true,
      },
    });

    if (!user?.cards) return null;

    return user.cards;
  } catch (error) {
    console.error("Error getting user cards:", error);
    return null;
  }
}
export async function createOrUpdateUser() {}
