// lib/microsoft-auth.ts
import { decrypt } from "./encryption";
import { getRedis } from "@/lib/redis";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "./db";

// Token expiration check utility
export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

// Microsoft token management
export async function getMicrosoftAccessToken(
  userId: string
): Promise<string | null> {
  try {
    const redis = await getRedis();
    const key = `user:${userId}:onedrive`;

    const tokenData = await redis.hGetAll(key);
    if (!tokenData.accessToken) return null;

    // Return valid token if not expired
    if (!isTokenExpired(tokenData.accessToken)) {
      return tokenData.accessToken;
    }

    // Refresh token if expired
    const newTokens = await refreshMicrosoftToken(
      tokenData.refreshToken,
      tokenData.accessToken
    );

    await redis.hSet(key, {
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || tokenData.refreshToken,
      expiresAt: (Date.now() + newTokens.expires_in * 1000).toString(),
    });

    return newTokens.access_token;
  } catch (error) {
    console.error("Failed to get Microsoft token:", error);
    return null;
  }
}

export async function refreshMicrosoftToken(
  refreshToken: string,
  fallbackToken: string
) {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    scope: "Files.Read offline_access",
  });

  const response = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Refresh failed: ${response.status} - ${errorText}`);

    // Fallback to previous token if refresh fails
    if (!isTokenExpired(fallbackToken)) {
      console.warn("Using fallback token despite refresh failure");
      return {
        access_token: fallbackToken,
        refresh_token: refreshToken,
        expires_in: 3600, // 1 hour fallback
      };
    }

    throw new Error("Token refresh failed with no valid fallback");
  }

  return response.json();
}

// Google token management (unchanged)
export async function getGoogleTokens(userId: string) {
  try {
    const tokens = await db.userGoogleToken.findUnique({
      where: { userId },
      select: { accessToken: true, refreshToken: true, expiresAt: true },
    });

    if (!tokens) throw new Error("No Google tokens found for user");

    return {
      accessToken: decrypt(tokens.accessToken),
      refreshToken: decrypt(tokens.refreshToken),
      expiresAt: tokens.expiresAt,
    };
  } catch (error) {
    console.error("Error retrieving Google tokens:", error);
    throw new Error("Failed to retrieve Google tokens");
  }
}
