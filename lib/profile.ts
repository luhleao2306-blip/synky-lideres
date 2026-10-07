import { env } from "cloudflare:workers";
import { ensureAuthSchema } from "./cloudflare-auth";

export async function profilePhotoUrl(userId: string): Promise<string | null> {
  await ensureAuthSchema();
  const photo = await env.DB!.prepare("SELECT updated_at FROM synky_profile_photos WHERE user_id=?").bind(userId).first<{ updated_at: string }>();
  return photo ? `/api/profile/photo?v=${encodeURIComponent(photo.updated_at)}` : null;
}

export async function boundedBody(request: Request, max: number): Promise<Uint8Array> {
  if (Number(request.headers.get("content-length")) > max) throw new Error("BODY_TOO_LARGE");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > max) { await reader.cancel(); throw new Error("BODY_TOO_LARGE"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export function photoMime(bytes: Uint8Array): string | null {
  if (bytes.length < 16) return null;
  if ([137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n)) return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 && bytes.at(-2) === 255 && bytes.at(-1) === 217) return "image/jpeg";
  if (new TextDecoder().decode(bytes.slice(0,4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8,12)) === "WEBP") return "image/webp";
  return null;
}
