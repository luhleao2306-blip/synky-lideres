import { env } from "cloudflare:workers";
import { createPasswordHash, ensureAuthSchema, issueSession, normalizeEmail, sameOrigin, seedBootstrapAdmin, sessionCookie, verifyPassword, validEmail } from "@/lib/cloudflare-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Solicitação inválida." }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Autenticação temporariamente indisponível." }, { status: 503 });
  let stage = "schema";
  try {
    await ensureAuthSchema();
    stage = "bootstrap";
    await seedBootstrapAdmin();
    stage = "credentials";
    const input = await request.json() as { email?: unknown; password?: unknown };
    const email = normalizeEmail(input.email);
    const password = typeof input.password === "string" ? input.password : "";
    if (!validEmail(email) || password.length < 1 || password.length > 256) return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    stage = "attempt-limit";
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const key = await (async () => {
      const bytes = new TextEncoder().encode(`${ip}:${email}`);
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(digest), (part) => part.toString(16).padStart(2, "0")).join("");
    })();
    const now = new Date();
    const attempt = await env.DB.prepare("SELECT attempts,window_started_at,blocked_until FROM synky_auth_attempts WHERE attempt_key=?").bind(key).first<{ attempts: number; window_started_at: string; blocked_until: string | null }>();
    if (attempt?.blocked_until && attempt.blocked_until > now.toISOString()) return Response.json({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, { status: 429 });
    stage = "account-lookup";
    const user = await env.DB.prepare("SELECT id,email,name,password_salt,password_hash,disabled_at FROM synky_auth_users WHERE email=? LIMIT 1").bind(email).first<{ id: string; email: string; name: string; password_salt: string; password_hash: string; disabled_at: string | null }>();
    stage = "password-check";
    const valid = user && !user.disabled_at ? await verifyPassword(password, user.password_salt, user.password_hash) : false;
    if (!valid || !user) {
      const activeWindow = attempt && now.getTime() - Date.parse(attempt.window_started_at) < 15 * 60_000;
      const attempts = activeWindow ? attempt.attempts + 1 : 1;
      const started = activeWindow ? attempt.window_started_at : now.toISOString();
      await env.DB.prepare(`INSERT INTO synky_auth_attempts(attempt_key,attempts,window_started_at,blocked_until,updated_at) VALUES(?,?,?,?,?)
        ON CONFLICT(attempt_key) DO UPDATE SET attempts=excluded.attempts,window_started_at=excluded.window_started_at,blocked_until=excluded.blocked_until,updated_at=excluded.updated_at`)
        .bind(key, attempts, started, attempts >= 7 ? new Date(now.getTime() + 15 * 60_000).toISOString() : null, now.toISOString()).run();
      await env.DB.prepare("INSERT INTO synky_auth_events(id,event_type,email,created_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(), "Falha de autenticação", email, now.toISOString()).run();
      return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }
    stage = "session-create";
    await env.DB.prepare("DELETE FROM synky_auth_attempts WHERE attempt_key=?").bind(key).run();
    await env.DB.prepare("INSERT INTO synky_auth_events(id,event_type,user_id,email,created_at) VALUES(?,?,?,?,?)").bind(crypto.randomUUID(), "Entrada realizada", user.id, user.email, now.toISOString()).run();
    const token = await issueSession(user.id);
    return Response.json({ ok: true, user: { email: user.email, name: user.name } }, { headers: { "Set-Cookie": sessionCookie(token, request.url), "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("auth login failed", error instanceof Error ? error.message : String(error));
    return Response.json({ error: "Não foi possível entrar agora. Tente novamente.", diagnostic: stage }, { status: 503 });
  }
}
