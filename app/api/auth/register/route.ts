import { env } from "cloudflare:workers";
import { createPasswordHash, ensureAuthSchema, expireIso, hashToken, issueSession, newOpaqueToken, normalizeEmail, sameOrigin, sessionCookie, validEmail } from "@/lib/cloudflare-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!env.DB) return Response.json({ error: "Cadastro temporariamente indisponível." }, { status: 503 });
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(token)) return Response.json({ error: "Este link de cadastro não é válido." }, { status: 404 });
  try {
    await ensureAuthSchema();
    const invite = await env.DB.prepare("SELECT email,company_name,expires_at FROM synky_registration_invites WHERE token_hash=? AND used_at IS NULL AND expires_at>? LIMIT 1").bind(await hashToken(token), new Date().toISOString()).first<{ email: string; company_name: string; expires_at: string }>();
    if (!invite) return Response.json({ error: "Este link expirou ou já foi utilizado." }, { status: 404 });
    return Response.json({ email: invite.email, companyName: invite.company_name, expiresAt: invite.expires_at }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Não foi possível validar o convite." }, { status: 503 }); }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Solicitação inválida." }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Cadastro temporariamente indisponível." }, { status: 503 });
  try {
    await ensureAuthSchema();
    const input = await request.json() as { token?: unknown; name?: unknown; password?: unknown };
    const token = typeof input.token === "string" ? input.token : "";
    const name = typeof input.name === "string" ? input.name.trim().slice(0, 100) : "";
    const password = typeof input.password === "string" ? input.password : "";
    if (!/^[A-Za-z0-9_-]{40,80}$/.test(token) || name.length < 2 || password.length < 12 || password.length > 256) return Response.json({ error: "Confira seu nome e use uma senha com pelo menos 12 caracteres." }, { status: 400 });
    const tokenHash = await hashToken(token);
    const invite = await env.DB.prepare("SELECT email,company_name FROM synky_registration_invites WHERE token_hash=? AND used_at IS NULL AND expires_at>? LIMIT 1").bind(tokenHash, new Date().toISOString()).first<{ email: string; company_name: string }>();
    if (!invite || !validEmail(invite.email)) return Response.json({ error: "Este link expirou ou já foi utilizado." }, { status: 410 });
    const duplicate = await env.DB.prepare("SELECT id FROM synky_auth_users WHERE email=? LIMIT 1").bind(normalizeEmail(invite.email)).first<{ id: string }>();
    if (duplicate) return Response.json({ error: "Este e-mail já possui acesso. Entre pela página de login." }, { status: 409 });
    const userId = crypto.randomUUID(), companyId = crypto.randomUUID(), now = new Date().toISOString();
    const { salt, hash } = await createPasswordHash(password);
    const batch = await env.DB.batch([
      env.DB.prepare("UPDATE synky_registration_invites SET used_at=? WHERE token_hash=? AND used_at IS NULL AND expires_at>?").bind(now, tokenHash, now),
      env.DB.prepare("INSERT INTO companies(id,name,kind,created_at) SELECT ?,?,?,? WHERE changes()=1").bind(companyId, invite.company_name, "organization", now),
      env.DB.prepare("INSERT INTO members(id,company_id,user_id,email,name,role) SELECT ?,?,?,?,?,? WHERE changes()=1").bind(crypto.randomUUID(), companyId, userId, normalizeEmail(invite.email), name, "admin"),
      env.DB.prepare("INSERT INTO synky_auth_users(id,email,name,password_salt,password_hash,created_at,updated_at) SELECT ?,?,?,?,?,?,? WHERE changes()=1").bind(userId, normalizeEmail(invite.email), name, salt, hash, now, now),
      env.DB.prepare("INSERT INTO synky_auth_events(id,event_type,user_id,email,company_id,created_at) SELECT ?,?,?,?,?,? WHERE changes()=1").bind(crypto.randomUUID(), "Cadastro por convite", userId, normalizeEmail(invite.email), companyId, now),
    ]);
    if (!batch[0]?.meta?.changes) return Response.json({ error: "Este link já foi utilizado." }, { status: 410 });
    const session = await issueSession(userId);
    return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(session, request.url), "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("invited registration failed", error);
    return Response.json({ error: "Não foi possível concluir o cadastro." }, { status: 503 });
  }
}
