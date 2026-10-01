import { env } from "cloudflare:workers";
import type { ChatGPTUser } from "./chatgpt-auth";

const COOKIE = "__Host-synky_one_access";
const HUB = "https://synky-hub.contato146558.chatgpt.site";
export type AppUser = ChatGPTUser & { isGuest: boolean };

export async function getAppUser(request: Request, _createVisitor = false): Promise<{ user: AppUser | null; cookie?: string }> {
  const cookie = request.headers.get("cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`));
  const token = cookie?.slice(COOKIE.length + 1);
  if (!token || !/^[A-Za-z0-9._-]{100,4096}$/.test(token)) return { user: null };
  let response: Response;
  try {
    response = await fetch(`${HUB}/api/grants/check`, {
      method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ product: "lideres" }), cache: "no-store",
    });
  } catch { return { user: null }; }
  if (!response.ok) return { user: null };
  const identity = await response.json() as { id: string; email: string; name: string };
  if (!env.DB) return { user: null };
  const existing = await env.DB.prepare("SELECT user_id FROM members WHERE email=? ORDER BY rowid LIMIT 1")
    .bind(identity.email).first<{ user_id: string }>();
  return { user: { userId: existing?.user_id || `one:${identity.id}`, email: identity.email,
    displayName: identity.name, fullName: identity.name, isGuest: false } };
}
