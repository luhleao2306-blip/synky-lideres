import { getChatGPTUser, type ChatGPTUser } from "./chatgpt-auth";

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
  const account = await getChatGPTUser();
  if (account) return { user: { ...account, isGuest: false } };

  let token = visitorToken(request);
  if (!token && !createVisitor) return { user: null };
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
