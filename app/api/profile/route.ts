import { env } from "cloudflare:workers";
import { getAppUser } from "../../guest-auth";
import { createPasswordHash, ensureAuthSchema, expireIso, hashToken, newOpaqueToken, normalizeEmail, sameOrigin, sessionCookie, validEmail, verifyPassword } from "@/lib/cloudflare-auth";
import { boundedBody, profilePhotoUrl } from "@/lib/profile";
import { reservedPlatformEmail } from "@/lib/platform-admin";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200, headers: Record<string,string> = {}) => Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
type Account = { id: string; email: string; name: string; password_salt: string; password_hash: string; disabled_at: string | null };

export async function GET(request: Request) {
  if (!env.DB) return json({ error: "Seu perfil está temporariamente indisponível." }, 503);
  try {
    const { user } = await getAppUser(request, false);
    if (!user || user.isGuest) return json({ error: "Entre para acessar seu perfil." }, 401);
    await ensureAuthSchema();
    const account = await env.DB.prepare("SELECT id,email,name FROM synky_auth_users WHERE id=? AND disabled_at IS NULL").bind(user.userId).first<Pick<Account,"id"|"email"|"name">>();
    return json({ profile: { name: account?.name || user.displayName, email: account?.email || user.email, avatarUrl: await profilePhotoUrl(user.userId), canEditCredentials: !!account } });
  } catch { return json({ error: "Não foi possível carregar seu perfil. Tente novamente." }, 503); }
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Solicitação inválida." }, 403);
  if (!env.DB) return json({ error: "Seu perfil está temporariamente indisponível." }, 503);
  try {
    const { user } = await getAppUser(request, false);
    if (!user || user.isGuest) return json({ error: "Entre para alterar seu perfil." }, 401);
    await ensureAuthSchema();
    const input = JSON.parse(new TextDecoder().decode(await boundedBody(request, 4096))) as { action?: unknown; email?: unknown; currentPassword?: unknown; newPassword?: unknown; confirmation?: unknown };
    if (!input || typeof input !== "object" || Array.isArray(input)) return json({ error: "Confira os dados da alteração." }, 400);
    if (input.action !== "email" && input.action !== "password") return json({ error: "Alteração inválida." }, 400);
    const account = await env.DB.prepare("SELECT id,email,name,password_salt,password_hash,disabled_at FROM synky_auth_users WHERE id=? AND disabled_at IS NULL").bind(user.userId).first<Account>();
    if (!account) return json({ error: "Este acesso é gerenciado pelo seu provedor de login. Altere e-mail e senha nesse provedor." }, 403);
    const currentPassword = typeof input.currentPassword === "string" ? input.currentPassword : "";
    const nextPassword = typeof input.newPassword === "string" ? input.newPassword : "";
    const email = typeof input.email === "string" && input.email.length <= 254 ? normalizeEmail(input.email) : "";
    if (currentPassword.length < 1 || currentPassword.length > 256) return json({ error: "Informe sua senha atual." }, 400);
    if (input.action === "email" && (!validEmail(email) || reservedPlatformEmail(email) && email !== account.email)) return json({ error: "Informe outro e-mail válido para sua conta." }, 400);
    if (input.action === "password" && (nextPassword.length < 12 || nextPassword.length > 256 || nextPassword !== input.confirmation || nextPassword === currentPassword)) return json({ error: "Use uma nova senha com 12 a 256 caracteres, diferente da atual, e confirme a mesma senha." }, 400);
    const key = await hashToken(`profile:${account.id}:${request.headers.get("cf-connecting-ip") || "unknown"}`), now = new Date().toISOString();
    const attempt = await env.DB.prepare("SELECT attempts,window_started_at,blocked_until FROM synky_auth_attempts WHERE attempt_key=?").bind(key).first<{ attempts:number; window_started_at:string; blocked_until:string|null }>();
    if (attempt?.blocked_until && attempt.blocked_until > now) return json({ error: "Muitas tentativas de confirmação. Aguarde 15 minutos." }, 429);
    if (!await verifyPassword(currentPassword, account.password_salt, account.password_hash)) {
      const recent = attempt && Date.now() - Date.parse(attempt.window_started_at) < 900_000;
      const count = recent ? attempt.attempts + 1 : 1;
      await env.DB.prepare(`INSERT INTO synky_auth_attempts(attempt_key,attempts,window_started_at,blocked_until,updated_at) VALUES(?,?,?,?,?)
        ON CONFLICT(attempt_key) DO UPDATE SET attempts=excluded.attempts,window_started_at=excluded.window_started_at,blocked_until=excluded.blocked_until,updated_at=excluded.updated_at`)
        .bind(key,count,recent ? attempt.window_started_at : now,count >= 5 ? expireIso(15) : null,now).run();
      return json({ error: "A senha atual não está correta." }, 400);
    }
    if (input.action === "email") {
      if (email === account.email) return json({ error: "Informe um e-mail diferente do atual." }, 400);
      const used = await env.DB.prepare(`SELECT id FROM synky_auth_users WHERE email=? AND id!=?
        UNION ALL SELECT id FROM members WHERE email=? COLLATE NOCASE AND user_id!=? LIMIT 1`).bind(email,account.id,email,account.id).first();
      if (used) return json({ error: "Não foi possível usar esse e-mail. Escolha outro." }, 409);
    }
    const credentials = input.action === "password" ? await createPasswordHash(nextPassword) : { salt: account.password_salt, hash: account.password_hash };
    const nextEmail = input.action === "email" ? email : account.email;
    const token = newOpaqueToken(), tokenHash = await hashToken(token);
    // A transação mantém os IDs de usuário e membro; preserva cursos e permissões.
    // A nova sessão funciona como guarda exclusiva desta operação. Um UPDATE
    // concorrente recusado não pode alterar membros nem invalidar outras sessões.
    const condition = "EXISTS(SELECT 1 FROM synky_auth_sessions WHERE token_hash=? AND user_id=?)";
    const revision = [tokenHash,account.id];
    const result = await env.DB.batch([
      env.DB.prepare("UPDATE synky_auth_users SET email=?,password_salt=?,password_hash=?,updated_at=? WHERE id=? AND email=? AND password_hash=? AND disabled_at IS NULL").bind(nextEmail,credentials.salt,credentials.hash,now,account.id,account.email,account.password_hash),
      env.DB.prepare("INSERT INTO synky_auth_sessions(token_hash,user_id,expires_at,created_at) SELECT ?,?,?,? WHERE changes()=1").bind(tokenHash,account.id,expireIso(7*24*60),now),
      env.DB.prepare(`UPDATE members SET email=? WHERE user_id=? AND ${condition}`).bind(nextEmail,account.id,...revision),
      env.DB.prepare(`DELETE FROM synky_auth_sessions WHERE user_id=? AND token_hash!=? AND ${condition}`).bind(account.id,tokenHash,...revision),
      env.DB.prepare(`INSERT INTO synky_auth_events(id,event_type,user_id,email,created_at) SELECT ?,?,?,?,? WHERE ${condition}`).bind(crypto.randomUUID(),input.action === "email" ? "E-mail de login alterado" : "Senha de login alterada",account.id,nextEmail,now,...revision),
    ]);
    if (!result[0]?.meta.changes) return json({ error: "Sua conta mudou em outra sessão. Atualize a página antes de tentar novamente." }, 409);
    await env.DB.prepare("DELETE FROM synky_auth_attempts WHERE attempt_key=?").bind(key).run().catch(()=>undefined);
    return json({ ok:true, email:nextEmail },200,{ "Set-Cookie":sessionCookie(token,request.url) });
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE") return json({ error: "Os dados enviados excedem o limite permitido." }, 413);
    if (error instanceof SyntaxError) return json({ error: "Confira os dados da alteração." }, 400);
    if (error instanceof Error && /UNIQUE constraint failed/i.test(error.message)) return json({ error: "Não foi possível usar esse e-mail. Escolha outro." }, 409);
    return json({ error: "Não foi possível salvar a alteração agora. Tente novamente." }, 503);
  }
}
