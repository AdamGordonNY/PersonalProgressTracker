import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

// lib/encryption.ts
export async function encrypt(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  return crypto.subtle
    .importKey(
      "raw",
      encoder.encode(process.env.ENCRYPTION_KEY!.padEnd(32)),
      "AES-GCM",
      false,
      ["encrypt"]
    )
    .then((key) => {
      return crypto.subtle
        .encrypt({ name: "AES-GCM", iv }, key, data)
        .then((encrypted) => {
          return JSON.stringify({
            iv: Array.from(iv),
            encrypted: Array.from(new Uint8Array(encrypted)),
          });
        });
    });
}

export async function decrypt(ciphertext: string) {
  const decoder = new TextDecoder();
  const { iv, encrypted } = JSON.parse(ciphertext);

  const encoder = new TextEncoder();
  return crypto.subtle
    .importKey(
      "raw",
      encoder.encode(process.env.ENCRYPTION_KEY!.padEnd(32)),
      "AES-GCM",
      false,
      ["decrypt"]
    )
    .then((key) => {
      return crypto.subtle
        .decrypt(
          { name: "AES-GCM", iv: new Uint8Array(iv) },
          key,
          new Uint8Array(encrypted)
        )
        .then((decrypted) => decoder.decode(decrypted));
    });
}
