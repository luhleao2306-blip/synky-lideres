import { env } from "cloudflare:workers";
import { clearSessionCookie, hashToken, sameOrigin, sessionToken } from "@/lib/cloudflare-auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Solicitação inválida." }, { status: 403 });
  const token = sessionToken(request.headers.get("cookie"));
  if (token && env.DB) {
    try { await env.DB.prepare("DELETE FROM synky_auth_sessions WHERE token_hash=?").bind(await hashToken(token)).run(); } catch { /* cookie still invalidated */ }
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie(request.url), "Cache-Control": "no-store" } });
}
