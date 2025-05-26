"use server";

import { db } from "@/lib/db";
import {
  encrypt,
  decrypt,
  setMicrosoftToken,
  getMicrosoftToken,
} from "@/lib/encryption";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { CloudTokens } from "@/lib/types";
import { NextResponse } from "next/server";

export async function handleUserEvent(userId: string, eventData: any) {
  try {
    const client = await clerkClient();

    // Get fresh OAuth tokens from Clerk
    const [googleTokenRes, microsoftTokenRes] = await Promise.allSettled([
      client.users.getUserOauthAccessToken(userId, "google"),
      client.users.getUserOauthAccessToken(userId, "microsoft"),
    ]);

    const cloudTokens: Record<string, string> = {};

    // Handle Google token
    if (
      googleTokenRes.status === "fulfilled" &&
      googleTokenRes.value.data.length > 0
    ) {
      cloudTokens.google = googleTokenRes.value.data[0].token;
    }

    // Handle Microsoft token
    if (
      microsoftTokenRes.status === "fulfilled" &&
      microsoftTokenRes.value.data.length > 0
    ) {
      cloudTokens.microsoft = microsoftTokenRes.value.data[0].token;
    }
    console.log("Cloud tokens retrieved:", cloudTokens);
    // Only update if we have valid tokens
    if (Object.keys(cloudTokens).length > 0) {
      const updateResult = await updateUserCloudTokens(userId, cloudTokens);
      if (!updateResult.success) {
        console.error("Failed to update cloud tokens:", updateResult.error);
      }
    }

    // Always update subscription status
    await updateUserSubscription(userId, "free");
  } catch (error) {
    console.error("Error processing user event:", error);
  }
}
// actions/user.ts
export async function updateUserCloudTokens(
  userId: string,
  tokens: CloudTokens
) {
  try {
    const client = await clerkClient();
    // Encrypt tokens
    await setMicrosoftToken(userId, tokens.microsoft!);

    // Update database
    await db.userMicrosoftToken.upsert({
      where: { id: userId },
      create: {
        userId: userId,
        accessToken: (await getMicrosoftToken(userId!)) ?? "",
        refreshToken: "", // Assuming you don't store refresh tokens
        expiresAt: new Date(Date.now() + 3600 * 1000), // Set expiry to 1 hour from now
      },
      update: {
        accessToken: (await getMicrosoftToken(userId!)) ?? "",
        expiresAt: new Date(Date.now() + 3600 * 1000), // Update expiry to 1 hour from now
      },
    });

    // Update Clerk metadata with token presence and hash
    client.users.updateUserMetadata(userId, {
      publicMetadata: {
        cloudAccess: {
          google: !!tokens.google,
          microsoft: !!tokens.microsoft,
        },
        // Add secure token reference (not the actual token)
        tokenHash: encrypt(tokens.microsoft!),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating cloud tokens:", error);
    return { success: false, error: "Failed to update cloud tokens" };
  }
}

// lib/security.ts

// export function createTokenHash(token: string | undefined) {
//   if (!token) return null;

//   return nodeCrypto
//     .createHash("sha256")
//     .update(token + process.env.ENCRYPTION_KEY!)
//     .digest("hex");
// }
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
export async function createOrUpdateUserToken({ userId }: { userId: string }) {
  try {
    const client = await clerkClient();
    const user = await db.user.findFirstOrThrow({
      where: { id: userId! },
      include: {
        UserMicrosoftToken: true,
        UserGoogleToken: true,
      },
    });
    if (!user?.UserMicrosoftToken) {
      const [googleTokenRes, microsoftTokenRes] = await Promise.allSettled([
        client.users.getUserOauthAccessToken(userId!, "google"),
        client.users.getUserOauthAccessToken(userId!, "microsoft"),
      ]);
      await setMicrosoftToken(
        userId!,
        microsoftTokenRes.status === "fulfilled" &&
          microsoftTokenRes.value.data.length > 0
          ? microsoftTokenRes.value.data[0].token
          : ""
      );

      await db.userMicrosoftToken.create({
        data: {
          userId: userId!,
          accessToken:
            microsoftTokenRes.status === "fulfilled" &&
            microsoftTokenRes.value.data.length > 0
              ? microsoftTokenRes.value.data[0].token
              : "",
          refreshToken: "",
          expiresAt: new Date(0),
        },
      });
    }
  } catch (error) {
    console.error("Error creating or updating user:", error);
  }
}

export async function handleSessionCreated(eventData: any) {
  try {
    const client = await clerkClient();
    const { user_id } = eventData;
    const user = await db.user.findUnique({
      where: { id: user_id },
      include: { UserMicrosoftToken: true },
    });

    if (!user?.UserMicrosoftToken) {
      const msToken = await getMicrosoftToken(user_id);

      // Update metadata with token verification
      await client.users.updateUserMetadata(user_id, {
        publicMetadata: {
          microsoftVerified: !!msToken,
          lastTokenRefresh: new Date().toISOString(),
        },
      });
      await db.userMicrosoftToken.update({
        where: { id: user_id },
        data: {
          accessToken: msToken || "",
          expiresAt: new Date(Date.now() + 3600 * 1000), // Set expiry to 1 hour from now
        },
      });
      const response = NextResponse.json({ success: true });
      response.cookies.set("ms_token", msToken || "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return response;
    }

    return NextResponse.json({ status: "Token exists" }, { status: 200 });
  } catch (error) {
    console.error("Session creation failed:", error);
    return NextResponse.json(
      { error: "Session processing failed" },
      { status: 500 }
    );
  }
}

export async function handleUserCreated(eventData: any) {
  try {
    const { id, email_addresses, first_name, last_name } = eventData;

    // Create user with transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id,
          email: email_addresses[0]?.email_address,
          name: `${first_name || ""} ${last_name || ""}`.trim() || null,
        },
      });

      // Create default board structure
      const board = await tx.board.create({
        data: {
          title: "My First Board",
          description: "Welcome to your content board!",
          order: 0,
          userId: user.id,
        },
      });

      // Create default columns
      const columns = ["Ideas", "Research", "In Progress", "Done"].map(
        (title, index) => ({
          title,
          order: index,
          boardId: board.id,
          userId: user.id,
        })
      );

      await tx.column.createMany({ data: columns });

      return user;
    });

    await createOrUpdateUserToken({ userId: result.id });
    await updateUserSubscription(result.id, "free");

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
        email: email_addresses[0]?.email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim() || null,
      },
    });

    await createOrUpdateUserToken({ userId: id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("User update failed:", error);
    return NextResponse.json({ error: "User update failed" }, { status: 500 });
  }
}

export async function handleUserDeleted(eventData: any) {
  try {
    const { id } = eventData;
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
