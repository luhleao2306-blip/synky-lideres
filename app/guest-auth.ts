import { env } from "cloudflare:workers";
import { getChatGPTUser, type ChatGPTUser } from "./chatgpt-auth";
import { identityFromCookie } from "@/lib/cloudflare-auth";
import { isPlatformAdmin } from "@/lib/platform-admin";

const ONE_COOKIE = "__Host-synky_one_access";
const ONE_HUB = "https://one.synky.com.br";

const COOKIE_NAME = "synky_visitor";
const COOKIE_AGE = 60 * 60 * 24 * 365;

export type AppUser = ChatGPTUser & { isGuest: boolean };

function visitorToken(request: Request): string | null {
  const cookie = request.headers.get("cookie")?.split(";").map(part => part.trim())
    .find(part => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  return cookie && /^[0-9a-f-]{36}$/.test(cookie) ? cookie : null;
}

async function visitorId(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `visitor:${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function getAppUser(request: Request, createVisitor = false): Promise<{ user: AppUser | null; cookie?: string }> {
  const session = await identityFromCookie(request.headers.get("cookie"));
  if (session) return { user: session };
  const centralCookie = request.headers.get("cookie")?.split(";").map(part => part.trim())
    .find(part => part.startsWith(`${ONE_COOKIE}=`));
  if (centralCookie) {
    const accessToken = centralCookie.slice(ONE_COOKIE.length + 1);
    if (!/^[A-Za-z0-9._-]{100,4096}$/.test(accessToken) || !env.DB) return { user: null };
    try {
      const response = await fetch(`${ONE_HUB}/api/grants/check`, {
        method: "POST", headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
        body: JSON.stringify({ product: "lideres" }), cache: "no-store",
      });
      if (!response.ok) return { user: null };
      const identity = await response.json() as { id: string; email: string; name: string };
      const member = await env.DB.prepare("SELECT user_id FROM members WHERE email=? ORDER BY rowid LIMIT 1")
        .bind(identity.email.trim().toLowerCase()).first<{ user_id: string }>();
      if (!member && !isPlatformAdmin({ email: identity.email, isGuest: false })) return { user: null };
      return { user: { userId: member?.user_id || `one:${identity.id}`, email: identity.email,
        displayName: identity.name, fullName: identity.name, isGuest: false } };
    } catch { return { user: null }; }
  }
  const account = await getChatGPTUser();
  if (account) {
    const member = env.DB ? await env.DB.prepare("SELECT user_id FROM members WHERE email=? ORDER BY rowid LIMIT 1").bind(account.email.trim().toLowerCase()).first<{ user_id: string }>().catch(() => null) : null;
    if (!member && !isPlatformAdmin({ email: account.email, isGuest: false })) return { user: null };
    return { user: { ...account, userId: member?.user_id || account.userId, isGuest: false } };
  }

  if (!createVisitor) return { user: null };
  let token = visitorToken(request);
  let cookie: string | undefined;
  if (!token) {
    token = crypto.randomUUID();
    cookie = `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${COOKIE_AGE}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
  }
  const userId = await visitorId(token);
  return {
    user: { userId, displayName: "Visitante", email: `${userId.slice(8, 24)}@visitor.synky.local`, fullName: null, isGuest: true },
    cookie,
  };
}
