import type { D1Database } from "@cloudflare/workers-types";

type OneIdentity = { id: string; email: string; name: string; is_admin?: boolean };

/** Called only after the Hub has verified the session and the Líderes grant. */
export async function oneMemberIdentity(db: D1Database, identity: OneIdentity) {
  if (typeof identity.id !== "string" || !identity.id || typeof identity.email !== "string" || !identity.email || typeof identity.name !== "string" || !identity.name) throw new Error("Invalid central identity");
  let mapping = await db.prepare("SELECT user_id FROM synky_one_identities WHERE one_user_id=?")
    .bind(identity.id).first<{ user_id: string }>();
  if (!mapping) {
    const existing = (await db.prepare("SELECT DISTINCT user_id FROM members WHERE email=? COLLATE NOCASE LIMIT 2")
      .bind(identity.email.trim().toLowerCase()).all<{ user_id: string }>()).results;
    // An ambiguous legacy e-mail must not grant access to another account.
    if (existing.length > 1) throw new Error("Ambiguous central identity");
    await db.prepare("INSERT OR IGNORE INTO synky_one_identities(one_user_id,user_id) VALUES(?,?)")
      .bind(identity.id, existing[0]?.user_id || `one:${identity.id}`).run();
    mapping = await db.prepare("SELECT user_id FROM synky_one_identities WHERE one_user_id=?")
      .bind(identity.id).first<{ user_id: string }>();
  }
  if (!mapping) throw new Error("Central identity unavailable");
  const member = await db.prepare("SELECT id FROM members WHERE user_id=? LIMIT 1")
    .bind(mapping.user_id).first();
  if (!member) {
    const companyId = `one:${identity.id}`, memberId = `one:${identity.id}`;
    await db.batch([
      db.prepare("INSERT OR IGNORE INTO companies(id,name,kind,created_at) VALUES(?,?,?,?)")
        .bind(companyId, `Espaço de ${identity.name.trim().slice(0, 70)}`, "personal", new Date().toISOString()),
      db.prepare("INSERT OR IGNORE INTO members(id,company_id,user_id,email,name,role) VALUES(?,?,?,?,?,?)")
        .bind(memberId, companyId, mapping.user_id, identity.email.trim().toLowerCase(), identity.name.trim().slice(0, 100), "participant"),
    ]);
  }
  return { userId: mapping.user_id, email: identity.email, displayName: identity.name,
    fullName: identity.name, isGuest: false as const, platformAdmin: identity.is_admin === true };
}
