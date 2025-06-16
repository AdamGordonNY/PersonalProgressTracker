// lib/tokens.ts
import { redis } from "@/lib/redis";

export const storeMicrosoftTokens = async (
  userId: string,
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // Unix timestamp in ms
  }
) => {
  await redis.hSet(`user:${userId}:onedrive`, tokens);
};

export const getMicrosoftTokens = async (userId: string) => {
  const tokens = await redis.hGetAll(`user:${userId}:onedrive`);
  return {
    accessToken: tokens.accessToken as string,
    refreshToken: tokens.refreshToken as string,
    expiresAt: parseInt(tokens.expiresAt || "0"),
  };
};
