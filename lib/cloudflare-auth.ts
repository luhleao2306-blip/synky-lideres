import type { D1Database } from "@cloudflare/workers-types";
import { env } from "cloudflare:workers";

const SESSION_COOKIE = "synky_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_ITERATIONS = 210_000;
const encoder = new TextEncoder();

export type SynkyIdentity = {
  userId: string;
  email: string;
  displayName: string;
  fullName: string;
  isGuest: false;
};

const schema = [
  `CREATE TABLE IF NOT EXISTS synky_auth_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    disabled_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS synky_auth_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES synky_auth_users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_synky_auth_sessions_user ON synky_auth_sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS synky_registration_invites (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE,
    company_name TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_synky_registration_invites_email ON synky_registration_invites(email, expires_at)`,
  `CREATE TABLE IF NOT EXISTS synky_auth_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT,
    email TEXT,
    company_id TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_synky_auth_events_created ON synky_auth_events(created_at)`,
  `CREATE TABLE IF NOT EXISTS synky_auth_attempts (
    attempt_key TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 0,
    window_started_at TEXT NOT NULL,
    blocked_until TEXT,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS synky_academy_progress (
    member_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    course_progress TEXT NOT NULL,
    final_grade REAL,
    studied_lessons INTEGER NOT NULL DEFAULT 0,
    total_lessons INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    PRIMARY KEY(member_id, company_id)
  )`,
];

let schemaPromise: Promise<void> | null = null;

export async function ensureAuthSchema(db: D1Database = requiredDb()): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      for (const sql of schema) await db.prepare(sql).run();
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  await schemaPromise;
}

function requiredDb(): D1Database {
  if (!env.DB) throw new Error("O armazenamento seguro está indisponível.");
  return env.DB;
}

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 254).toLowerCase() : "";
}

export function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function fromHex(value: string): Uint8Array {
  return new Uint8Array(value.match(/.{2}/g)?.map((part) => Number.parseInt(part, 16)) || []);
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const value of bytes) binary += String.fromCharCode(value);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function newOpaqueToken(bytes = 32): string {
  const value = crypto.getRandomValues(new Uint8Array(bytes));
  return base64Url(value);
}

export async function hashToken(value: string): Promise<string> {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

export async function createPasswordHash(password: string, salt?: string): Promise<{ salt: string; hash: string }> {
  const saltValue = salt ? fromHex(salt) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltValue, iterations: PASSWORD_ITERATIONS }, key, 256);
  return { salt: hex(saltValue), hash: hex(new Uint8Array(bits)) };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const result = fromHex((await createPasswordHash(password, salt)).hash);
  const expected = fromHex(expectedHash);
  if (result.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < result.length; index += 1) difference |= result[index] ^ expected[index];
  return difference === 0;
}

export function sessionCookie(token: string, requestUrl: string): string {
  const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_SECONDS}${secure}`;
}

export function clearSessionCookie(requestUrl: string): string {
  const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}

export function sessionToken(cookieHeader: string | null): string | null {
  const item = cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const token = item?.slice(SESSION_COOKIE.length + 1) || "";
  return /^[A-Za-z0-9_-]{40,80}$/.test(token) ? token : null;
}

type UserRow = { id: string; email: string; name: string; disabled_at: string | null };

export async function identityFromCookie(cookieHeader: string | null, db: D1Database = requiredDb()): Promise<SynkyIdentity | null> {
  const token = sessionToken(cookieHeader);
  if (!token) return null;
  try {
    await ensureAuthSchema(db);
    const row = await db.prepare(`SELECT u.id,u.email,u.name,u.disabled_at
      FROM synky_auth_sessions s JOIN synky_auth_users u ON u.id=s.user_id
      WHERE s.token_hash=? AND s.expires_at>? LIMIT 1`).bind(await hashToken(token), new Date().toISOString()).first<UserRow>();
    if (!row || row.disabled_at) return null;
    return { userId: row.id, email: row.email, displayName: row.name, fullName: row.name, isGuest: false };
  } catch {
    return null;
  }
}

export async function issueSession(userId: string, db: D1Database = requiredDb()): Promise<string> {
  const token = newOpaqueToken();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_SECONDS * 1000).toISOString();
  await db.prepare("INSERT INTO synky_auth_sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)")
    .bind(await hashToken(token), userId, expires, now.toISOString()).run();
  return token;
}

export async function seedBootstrapAdmin(db: D1Database = requiredDb()): Promise<void> {
  const password = env.SYNKY_ADMIN_INITIAL_PASSWORD;
  if (!password || password.length < 12) return;
  const email = "admin@synky.com.br";
  const existing = await db.prepare("SELECT id FROM synky_auth_users WHERE email=? LIMIT 1").bind(email).first<{ id: string }>();
  if (existing) return;
  const { salt, hash } = await createPasswordHash(password);
  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  await db.prepare(`INSERT INTO synky_auth_users(id,email,name,password_salt,password_hash,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?)`).bind(userId, email, "Administrador Synky", salt, hash, now, now).run();
  await db.prepare("INSERT INTO synky_auth_events(id,event_type,user_id,email,created_at) VALUES(?,?,?,?,?)")
    .bind(crypto.randomUUID(), "Conta administrativa inicializada", userId, email, now).run();
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}

export function safeReturnPath(value: unknown, fallback = "/app"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://leaders.synky.local");
    if (url.origin !== "https://leaders.synky.local" || ["/login", "/cadastro", "/api"].some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}

export function expireIso(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}
